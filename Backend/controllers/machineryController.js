const mongoose = require('mongoose');
const Machinery = require('../models/Machinery');
const { saveMultipleBase64Images } = require('../utils/saveBase64Image');

const formatMachinery = (item) => {
  const obj = item.toObject ? item.toObject() : item;

  // Extract first image
  let primaryImage = '';
  if (Array.isArray(obj.machineImages) && obj.machineImages.length > 0) {
    const first = obj.machineImages[0];
    if (typeof first === 'string') {
      primaryImage = first;
    } else if (first && typeof first === 'object') {
      primaryImage = first.data || first.preview || first.url || '';
    }
  }

  const effectivePrice =
    obj.discountPrice !== null && obj.discountPrice !== undefined && obj.discountPrice > 0
      ? obj.discountPrice
      : obj.price;

  return {
    ...obj,
    id: obj._id,
    name: obj.title,
    brand: obj.brandName,
    power: obj.implementPower || 'N/A',
    type: obj.implementType || obj.category || 'Equipment',
    image: primaryImage,
    featuredImage: {
      name: 'featured-image.jpg',
      data: primaryImage,
    },
    formattedPrice: effectivePrice
      ? `₹ ${Number(effectivePrice).toLocaleString('en-IN')}`
      : 'Price on Request',
  };
};

// @desc    Get all machinery & equipment
// @route   GET /api/machinery
exports.getMachineries = async (req, res) => {
  try {
    const { category, brand, type, status, search, sort } = req.query;
    let query = {};

    if (category && category !== 'All Categories' && category !== 'All Equipment Types' && category !== 'All') {
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
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'priceLow') {
      sortOption = { price: 1 };
    } else if (sort === 'priceHigh') {
      sortOption = { price: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const machineries = await Machinery.find(query).sort(sortOption);
    const formatted = machineries.map(formatMachinery);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
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
      const regexExact = new RegExp(`^${cleanPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

      item = await Machinery.findOne({
        $or: [
          { title: regexExact },
          { modelName: regexExact },
          { code: regexExact },
        ],
      });

      // 3. Fallback to flexible slug search
      if (!item) {
        const words = cleanPattern.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          const flexibleRegex = new RegExp(words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'), 'i');
          item = await Machinery.findOne({
            $or: [
              { title: flexibleRegex },
              { modelName: flexibleRegex },
            ],
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
      price,
      discountPrice,
      description,
      specification,
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

    if (!resolvedTitle) {
      return res.status(400).json({ success: false, message: 'Machine title is required' });
    }
    if (!resolvedBrand) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }
    if (!resolvedCategory) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    const numPrice = Number(price);
    const numDiscount =
      discountPrice !== undefined && discountPrice !== null && discountPrice !== ''
        ? Number(discountPrice)
        : null;

    const newMachinery = await Machinery.create({
      title: resolvedTitle,
      brandName: resolvedBrand,
      modelName: (modelName || '').trim(),
      implementType: (implementType || type || '').trim(),
      category: resolvedCategory,
      implementPower: (implementPower || power || '').trim(),
      price: numPrice,
      discountPrice: numDiscount,
      description: (description || '').trim(),
      specification: (specification || '').trim(),
      availableAtStore: availableAtStore || 'Yes',
      status: status || 'Available',
      sponsored: Boolean(sponsored),
      code: code ? code.trim() : undefined,
      machineImages: Array.isArray(machineImages)
        ? saveMultipleBase64Images(machineImages, 'machinery')
        : [],
      documents: Array.isArray(documents) ? documents : [],
    });

    res.status(201).json({
      success: true,
      message: 'Machinery equipment saved successfully in database',
      data: formatMachinery(newMachinery),
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
      price,
      discountPrice,
      description,
      specification,
      availableAtStore,
      status,
      sponsored,
      code,
      machineImages,
      documents,
    } = req.body;

    if (title || name) item.title = (title || name).trim();
    if (brandName || brand) item.brandName = (brandName || brand).trim();
    if (modelName !== undefined) item.modelName = modelName.trim();
    if (implementType !== undefined || type !== undefined) item.implementType = (implementType || type || '').trim();
    if (category) item.category = category.trim();
    if (implementPower !== undefined || power !== undefined) item.implementPower = (implementPower || power || '').trim();
    if (price !== undefined && !isNaN(Number(price))) item.price = Number(price);
    if (discountPrice !== undefined) {
      item.discountPrice =
        discountPrice === '' || discountPrice === null ? null : Number(discountPrice);
    }
    if (description !== undefined) item.description = description.trim();
    if (specification !== undefined) item.specification = specification.trim();
    if (availableAtStore !== undefined) item.availableAtStore = availableAtStore;
    if (status !== undefined) item.status = status;
    if (sponsored !== undefined) item.sponsored = Boolean(sponsored);
    if (code !== undefined) item.code = code.trim();
    if (Array.isArray(machineImages)) item.machineImages = saveMultipleBase64Images(machineImages, 'machinery');
    if (Array.isArray(documents)) item.documents = documents;

    const updated = await item.save();

    res.json({
      success: true,
      message: 'Machinery equipment updated successfully in database',
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
      message: 'Machinery equipment deleted successfully from database',
    });
  } catch (error) {
    console.error('Error deleting machinery:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
