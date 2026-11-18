const mongoose = require('mongoose');
const Machinery = require('../models/Machinery');
const { saveMultipleBase64Images } = require('../utils/saveBase64Image');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB max image size
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB max document size

// Sanitize documents to remove unsafe blob URLs and ensure valid structure
const sanitizeDocuments = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs
    .map((d) => {
      if (!d) return null;
      if (typeof d === 'string') {
        if (d.startsWith('blob:')) return null;
        return { name: 'Document', url: d };
      }
      const url = d.url || d.path || '';
      if (typeof url === 'string' && url.startsWith('blob:')) return null;
      return {
        name: d.name || 'Document',
        url: url,
        size: d.size || 0,
        type: d.type || 'application/pdf',
      };
    })
    .filter(Boolean);
};

// Format machinery for complete compatibility across both frontend and admin panel
const formatMachinery = (item) => {
  const obj = item.toObject ? item.toObject() : item;

  let primaryImage = '';
  if (Array.isArray(obj.machineImages) && obj.machineImages.length > 0) {
    const first = obj.machineImages[0];
    if (typeof first === 'string') {
      primaryImage = first;
    } else if (first && typeof first === 'object') {
      primaryImage = first.url || first.data || first.preview || '';
    }
  }

  const effectivePrice =
    obj.discountPrice !== null && obj.discountPrice !== undefined && obj.discountPrice > 0
      ? obj.discountPrice
      : obj.price;

  const itemId = String(obj._id || obj.id || '');

  return {
    ...obj,
    _id: itemId,
    id: itemId,
    name: obj.title,
    brand: obj.brandName || obj.brand || 'Rhinco',
    power: obj.implementPower || obj.powerRequirement || '35 - 50 HP',
    type: obj.implementType || obj.category || 'Farm Equipment',
    image: primaryImage,
    featuredImage: {
      name: 'featured-image.jpg',
      data: primaryImage,
      url: primaryImage,
    },
    formattedPrice: effectivePrice
      ? `₹ ${Number(effectivePrice).toLocaleString('en-IN')}`
      : 'Price on Request',
  };
};

// @desc    Get all machinery & equipment with query filters, search, and sorting
// @route   GET /api/machinery
exports.getMachineries = async (req, res) => {
  try {
    const { category, brand, type, status, search, sort } = req.query;
    let query = {};

    if (
      category &&
      category !== 'All Categories' &&
      category !== 'All Equipment Types' &&
      category !== 'All'
    ) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (brand && brand !== 'All Brands' && brand !== 'All') {
      query.brandName = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    if (type && type !== 'All Types' && type !== 'All') {
      query.implementType = { $regex: new RegExp(`^${type}$`, 'i') };
    }

    if (status && status !== 'All Status' && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { brandName: { $regex: s, $options: 'i' } },
        { modelName: { $regex: s, $options: 'i' } },
        { implementType: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { specification: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low' || sort === 'priceAsc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high' || sort === 'priceDesc') {
      sortOption = { price: -1 };
    } else if (sort === 'name' || sort === 'nameAsc') {
      sortOption = { title: 1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const items = await Machinery.find(query).sort(sortOption);

    res.json({
      success: true,
      count: items.length,
      data: items.map(formatMachinery),
    });
  } catch (error) {
    console.error('Error fetching machinery:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single machinery item by id, slug, or title
// @route   GET /api/machinery/:id
exports.getMachineryById = async (req, res) => {
  try {
    const param = (req.params.id || '').trim();
    let item = null;

    // 1. Try finding by MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(param)) {
      item = await Machinery.findById(param);
    }

    // 2. Try finding by title, modelName, code, or slug
    if (!item) {
      const decoded = decodeURIComponent(param);
      const cleanPattern = decoded.replace(/-/g, ' ').trim();
      const regexExact = new RegExp(
        `^${cleanPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i'
      );

      item = await Machinery.findOne({
        $or: [{ title: regexExact }, { modelName: regexExact }, { code: regexExact }],
      });

      // 3. Fallback to flexible slug search
      if (!item) {
        const words = cleanPattern.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          const flexibleRegex = new RegExp(
            words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'),
            'i'
          );
          item = await Machinery.findOne({
            $or: [{ title: flexibleRegex }, { modelName: flexibleRegex }],
          });
        }
      }
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Machinery not found' });
    }

    res.json({
      success: true,
      data: formatMachinery(item),
    });
  } catch (error) {
    console.error('Error fetching machinery by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new machinery equipment
// @route   POST /api/machinery
exports.createMachinery = async (req, res) => {
  try {
    const {
      title,
      name,
      brandName,
      brand,
      modelName,
      implementType,
      type,
      category,
      implementPower,
      power,
      powerRequirement,
      price,
      discount,
      discountPrice,
      description,
      specification,
      warranty,
      availableAtStore,
      status,
      sponsored,
      code,
      machineImages,
      documents,
    } = req.body;

    const resolvedTitle = (title || name || '').trim();
    const resolvedBrand = (brandName || brand || '').trim();
    const resolvedCategory = (category || '').trim();
    const resolvedType = (implementType || type || resolvedCategory || '').trim();
    const resolvedDesc = (description || '').trim();

    if (!resolvedTitle) {
      return res.status(400).json({ success: false, message: 'Machine title is required' });
    }
    if (!resolvedBrand) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }
    if (!resolvedCategory) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (!resolvedDesc) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    // Verify image size limits (max 5 MB)
    if (Array.isArray(machineImages)) {
      const oversized = machineImages.find(
        (img) => img && typeof img === 'object' && img.size && img.size > MAX_IMAGE_BYTES
      );
      if (oversized) {
        const mb = (oversized.size / (1024 * 1024)).toFixed(2);
        return res.status(400).json({
          success: false,
          message: `Image size limit exceeded! Maximum allowed image size is 5 MB. Found: "${oversized.name || 'Image'}" (${mb} MB)`,
        });
      }
    }

    // Verify document size limits (max 10 MB)
    if (Array.isArray(documents)) {
      const oversizedDoc = documents.find(
        (doc) => doc && typeof doc === 'object' && doc.size && doc.size > MAX_DOC_BYTES
      );
      if (oversizedDoc) {
        const mb = (oversizedDoc.size / (1024 * 1024)).toFixed(2);
        return res.status(400).json({
          success: false,
          message: `Document size limit exceeded! Maximum allowed document size is 10 MB. Found: "${oversizedDoc.name || 'Document'}" (${mb} MB)`,
        });
      }
    }

    const numDiscount = Number(discount) || 0;
    let finalDiscountPrice = null;
    if (discountPrice !== undefined && discountPrice !== null && discountPrice !== '') {
      finalDiscountPrice = Number(discountPrice);
    } else if (numDiscount > 0) {
      finalDiscountPrice = Math.max(0, numPrice - (numPrice * numDiscount) / 100);
    }

    // Process and normalize images
    let rawImages = [];
    if (Array.isArray(machineImages)) {
      rawImages = machineImages
        .map((img) => (typeof img === 'string' ? img : img.data || img.preview || img.url || ''))
        .filter(Boolean);
    } else if (typeof machineImages === 'string' && machineImages) {
      rawImages = [machineImages];
    }

    const savedImages = await saveMultipleBase64Images(rawImages, 'machinery', 'machine');
    const safeDocs = sanitizeDocuments(documents);

    const newMachine = await Machinery.create({
      title: resolvedTitle,
      brandName: resolvedBrand,
      brand: resolvedBrand,
      modelName: (modelName || '').trim(),
      implementType: resolvedType,
      category: resolvedCategory,
      implementPower: (implementPower || power || powerRequirement || '').trim(),
      powerRequirement: (implementPower || power || powerRequirement || '').trim(),
      price: numPrice,
      discount: numDiscount,
      discountPrice: finalDiscountPrice,
      description: resolvedDesc,
      specification: (specification || '').trim(),
      warranty: (warranty || '1 Year Standard').trim(),
      availableAtStore: availableAtStore === 'No' ? 'No' : 'Yes',
      status: status || 'Available',
      sponsored: sponsored === true || sponsored === 'true',
      code: (code || '').trim(),
      machineImages: savedImages,
      documents: safeDocs,
    });

    res.status(201).json({
      success: true,
      message: 'Machinery equipment successfully saved to database',
      data: formatMachinery(newMachine),
    });
  } catch (error) {
    console.error('Error creating machinery:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update machinery equipment
// @route   PUT /api/machinery/:id
exports.updateMachinery = async (req, res) => {
  try {
    const item = await Machinery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Machinery not found' });
    }

    const {
      title,
      name,
      brandName,
      brand,
      modelName,
      implementType,
      type,
      category,
      implementPower,
      power,
      powerRequirement,
      price,
      discount,
      discountPrice,
      description,
      specification,
      warranty,
      availableAtStore,
      status,
      sponsored,
      code,
      machineImages,
      documents,
    } = req.body;

    if (title || name) item.title = (title || name).trim();
    if (brandName || brand) {
      const b = (brandName || brand).trim();
      item.brandName = b;
      item.brand = b;
    }
    if (modelName !== undefined) item.modelName = modelName.trim();
    if (implementType || type) item.implementType = (implementType || type).trim();
    if (category) item.category = category.trim();
    if (implementPower || power || powerRequirement) {
      const p = (implementPower || power || powerRequirement).trim();
      item.implementPower = p;
      item.powerRequirement = p;
    }
    if (price !== undefined) {
      const p = Number(price);
      if (!isNaN(p) && p >= 0) item.price = p;
    }
    if (discount !== undefined) {
      const d = Number(discount);
      if (!isNaN(d) && d >= 0 && d <= 100) item.discount = d;
    }
    if (discountPrice !== undefined) {
      item.discountPrice = discountPrice !== '' && discountPrice !== null ? Number(discountPrice) : null;
    }
    if (description) item.description = description.trim();
    if (specification !== undefined) item.specification = specification.trim();
    if (warranty !== undefined) item.warranty = warranty.trim();
    if (availableAtStore !== undefined) item.availableAtStore = availableAtStore;
    if (status !== undefined) item.status = status;
    if (sponsored !== undefined) item.sponsored = sponsored === true || sponsored === 'true';
    if (code !== undefined) item.code = code.trim();

    if (machineImages !== undefined) {
      let rawImages = [];
      if (Array.isArray(machineImages)) {
        rawImages = machineImages
          .map((img) => (typeof img === 'string' ? img : img.data || img.preview || img.url || ''))
          .filter(Boolean);
      } else if (typeof machineImages === 'string' && machineImages) {
        rawImages = [machineImages];
      }
      item.machineImages = await saveMultipleBase64Images(rawImages, 'machinery', 'machine');
    }

    if (documents !== undefined) {
      item.documents = sanitizeDocuments(documents);
    }

    const updated = await item.save();

    res.json({
      success: true,
      message: 'Machinery equipment updated successfully',
      data: formatMachinery(updated),
    });
  } catch (error) {
    console.error('Error updating machinery:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete machinery equipment
// @route   DELETE /api/machinery/:id
exports.deleteMachinery = async (req, res) => {
  try {
    const item = await Machinery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Machinery not found' });
    }

    await Machinery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Machinery equipment successfully deleted from database',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting machinery:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
