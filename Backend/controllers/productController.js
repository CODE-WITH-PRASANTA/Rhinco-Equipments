const Product = require('../models/Product');
const { saveMultipleBase64Images } = require('../utils/saveBase64Image');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB max image size

// Format product for complete compatibility across both frontend and admin panel
const formatProduct = (p) => {
  const obj = p.toObject ? p.toObject() : p;
  const primaryImg =
    Array.isArray(obj.images) && obj.images.length > 0 ? obj.images[0] : '';
  const priceVal = Number(obj.price || 0);
  const discVal = Number(obj.discount || 0);
  const finalVal =
    obj.finalPrice !== undefined && obj.finalPrice !== null
      ? Number(obj.finalPrice)
      : Math.max(0, priceVal - (priceVal * discVal) / 100);
  const itemId = String(obj._id || obj.id || '');

  return {
    ...obj,
    _id: itemId,
    id: itemId,
    name: obj.title,
    brand: obj.companyName || obj.brand || 'Rhinco',
    companyName: obj.companyName || obj.brand || 'Rhinco',
    image: primaryImg,
    featuredImage: primaryImg,
    price: finalVal,
    salesPrice: finalVal,
    regularPrice: priceVal,
    mrp: priceVal,
    oldPrice: priceVal,
    finalPrice: finalVal,
    discount: discVal,
    stockStatus: obj.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
  };
};

// @desc    Get all products with filters, search, and sorting
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, bestSeller } = req.query;
    let query = {};

    if (category && category !== 'All Products' && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { companyName: { $regex: s, $options: 'i' } },
        { brand: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
      ];
    }

    if (bestSeller === 'true' || bestSeller === true) {
      query.bestSeller = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.finalPrice = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.finalPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.finalPrice.$lte = Number(maxPrice);
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low' || sort === 'priceAsc') {
      sortOption = { finalPrice: 1 };
    } else if (sort === 'price-high' || sort === 'priceDesc') {
      sortOption = { finalPrice: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'name' || sort === 'nameAsc') {
      sortOption = { title: 1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      data: products.map(formatProduct),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID or title slug
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const param = (req.params.id || '').trim();
    let product = null;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(param);
    }

    if (!product) {
      const decoded = decodeURIComponent(param).replace(/-/g, ' ');
      const regex = new RegExp(`^${decoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      product = await Product.findOne({
        $or: [{ title: regex }, { code: regex }],
      });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: formatProduct(product),
    });
  } catch (error) {
    console.error('Error fetching product by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      name,
      category,
      companyName,
      brand,
      description,
      price,
      discount,
      finalPrice,
      stockQuantity,
      bestSeller,
      badge,
      rating,
      reviews,
      images,
    } = req.body;

    const resolvedTitle = (title || name || '').trim();
    const resolvedBrand = (companyName || brand || '').trim();
    const resolvedCategory = (category || '').trim();
    const resolvedDesc = (description || '').trim();

    if (!resolvedTitle) {
      return res.status(400).json({ success: false, message: 'Product title is required' });
    }
    if (!resolvedCategory) {
      return res.status(400).json({ success: false, message: 'Product category is required' });
    }
    if (!resolvedBrand) {
      return res.status(400).json({ success: false, message: 'Company or Brand name is required' });
    }
    if (!resolvedDesc) {
      return res.status(400).json({ success: false, message: 'Product description is required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive price is required' });
    }

    // Verify image size limits (max 5 MB)
    if (Array.isArray(images)) {
      const oversized = images.find(
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

    const numDiscount = Number(discount) || 0;
    const calcFinalPrice =
      finalPrice !== undefined && !isNaN(Number(finalPrice)) && Number(finalPrice) > 0
        ? Number(finalPrice)
        : Math.max(0, numPrice - (numPrice * numDiscount) / 100);

    // Normalize image inputs
    let rawImages = [];
    if (Array.isArray(images)) {
      rawImages = images
        .map((img) => (typeof img === 'string' ? img : img.url || img.preview || img.data || ''))
        .filter(Boolean);
    } else if (typeof images === 'string' && images) {
      rawImages = [images];
    }

    // Save base64 images if present, otherwise keep clean /uploads/ URL
    const savedImages = await saveMultipleBase64Images(rawImages, 'product', 'product');

    const isBestSeller = bestSeller === true || bestSeller === 'true';

    const newProduct = await Product.create({
      title: resolvedTitle,
      category: resolvedCategory,
      companyName: resolvedBrand,
      brand: resolvedBrand,
      description: resolvedDesc,
      price: numPrice,
      discount: numDiscount,
      finalPrice: calcFinalPrice,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 1,
      stockStatus: Number(stockQuantity) > 0 ? 'In Stock' : 'Out of Stock',
      bestSeller: isBestSeller,
      badge: badge || (isBestSeller ? 'Best Seller' : ''),
      rating: rating !== undefined ? Number(rating) : 4.8,
      reviews: reviews !== undefined ? Number(reviews) : 12,
      images: savedImages,
    });

    res.status(201).json({
      success: true,
      message: 'Product successfully created and saved to database',
      data: formatProduct(newProduct),
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      title,
      name,
      category,
      companyName,
      brand,
      description,
      price,
      discount,
      finalPrice,
      stockQuantity,
      bestSeller,
      badge,
      rating,
      reviews,
      images,
    } = req.body;

    if (title || name) product.title = (title || name).trim();
    if (category) product.category = category.trim();
    if (companyName || brand) {
      const b = (companyName || brand).trim();
      product.companyName = b;
      product.brand = b;
    }
    if (description) product.description = description.trim();
    if (price !== undefined) {
      const p = Number(price);
      if (!isNaN(p) && p >= 0) product.price = p;
    }
    if (discount !== undefined) {
      const d = Number(discount);
      if (!isNaN(d) && d >= 0 && d <= 100) product.discount = d;
    }
    if (finalPrice !== undefined && !isNaN(Number(finalPrice))) {
      product.finalPrice = Number(finalPrice);
    } else if (product.price !== undefined) {
      product.finalPrice = Math.max(0, product.price - (product.price * (product.discount || 0)) / 100);
    }
    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      product.stockStatus = product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
    }
    if (bestSeller !== undefined) {
      product.bestSeller = bestSeller === true || bestSeller === 'true';
    }
    if (badge !== undefined) product.badge = badge;
    if (rating !== undefined) product.rating = Number(rating);
    if (reviews !== undefined) product.reviews = Number(reviews);

    if (images !== undefined) {
      let rawImages = [];
      if (Array.isArray(images)) {
        rawImages = images
          .map((img) => (typeof img === 'string' ? img : img.url || img.preview || img.data || ''))
          .filter(Boolean);
      } else if (typeof images === 'string' && images) {
        rawImages = [images];
      }
      product.images = await saveMultipleBase64Images(rawImages, 'product', 'product');
    }

    const updated = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: formatProduct(updated),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product successfully deleted from database',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
