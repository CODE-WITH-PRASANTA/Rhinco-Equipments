const Product = require('../models/Product');
const { saveMultipleBase64Images } = require('../utils/saveBase64Image');

// @desc    Get all products
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
        { description: { $regex: s, $options: 'i' } },
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
    if (sort === 'price-low') {
      sortOption = { finalPrice: 1 };
    } else if (sort === 'price-high') {
      sortOption = { finalPrice: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'name') {
      sortOption = { title: 1 };
    }

    const products = await Product.find(query).sort(sortOption);

    // Format products so both `title` and `name` are available for frontend compatibility
    const formatted = products.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        name: obj.title, // alias for frontend templates expecting `name`
        image: obj.images && obj.images.length > 0 ? obj.images[0] : '', // primary image
        oldPrice: obj.price,
        price: obj.finalPrice || obj.price,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const obj = product.toObject();
    res.json({
      success: true,
      data: {
        ...obj,
        name: obj.title,
        image: obj.images && obj.images.length > 0 ? obj.images[0] : '',
        oldPrice: obj.price,
        price: obj.finalPrice || obj.price,
      },
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

    const productTitle = (title || name || '').trim();
    if (!productTitle) {
      return res.status(400).json({ success: false, message: 'Product title is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Product category is required' });
    }
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company or Brand name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Product description is required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Valid product price is required' });
    }

    const numDiscount = Number(discount) || 0;
    const calcFinalPrice =
      finalPrice !== undefined && !isNaN(Number(finalPrice))
        ? Number(finalPrice)
        : Math.max(0, numPrice - (numPrice * numDiscount) / 100);

    // Normalize images: accept array of strings, or array of objects with preview/url, or single string
    let normalizedImages = [];
    if (Array.isArray(images)) {
      normalizedImages = images.map((img) =>
        typeof img === 'string' ? img : img.preview || img.url || ''
      ).filter(Boolean);
    } else if (typeof images === 'string' && images) {
      normalizedImages = [images];
    }

    const isBestSeller = bestSeller === true || bestSeller === 'true';

    const newProduct = await Product.create({
      title: productTitle,
      category: category.trim(),
      companyName: companyName.trim(),
      description: description.trim(),
      price: numPrice,
      discount: numDiscount,
      finalPrice: calcFinalPrice,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 1,
      bestSeller: isBestSeller,
      badge: badge || (isBestSeller ? 'Best Seller' : ''),
      rating: rating !== undefined ? Number(rating) : 4.8,
      reviews: reviews !== undefined ? Number(reviews) : 12,
      images: await saveMultipleBase64Images(normalizedImages, 'product', 'product'),
    });

    const obj = newProduct.toObject();
    res.status(201).json({
      success: true,
      message: 'Product created successfully in database',
      data: {
        ...obj,
        name: obj.title,
        image: obj.images && obj.images.length > 0 ? obj.images[0] : '',
        oldPrice: obj.price,
        price: obj.finalPrice || obj.price,
      },
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
    if (companyName) product.companyName = companyName.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);

    if (finalPrice !== undefined) {
      product.finalPrice = Number(finalPrice);
    } else if (price !== undefined || discount !== undefined) {
      const p = product.price;
      const d = product.discount || 0;
      product.finalPrice = Math.max(0, p - (p * d) / 100);
    }

    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (bestSeller !== undefined) {
      product.bestSeller = bestSeller === true || bestSeller === 'true';
      if (product.bestSeller && !product.badge) product.badge = 'Best Seller';
    }
    if (badge !== undefined) product.badge = badge;
    if (rating !== undefined) product.rating = Number(rating);
    if (reviews !== undefined) product.reviews = Number(reviews);

    if (images !== undefined) {
      let updatedImages = [];
      if (Array.isArray(images)) {
        updatedImages = images.map((img) =>
          typeof img === 'string' ? img : img.preview || img.url || ''
        ).filter(Boolean);
      } else if (typeof images === 'string') {
        updatedImages = [images];
      }
      product.images = await saveMultipleBase64Images(updatedImages, 'product', 'product');
    }

    await product.save();

    const obj = product.toObject();
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        ...obj,
        name: obj.title,
        image: obj.images && obj.images.length > 0 ? obj.images[0] : '',
        oldPrice: obj.price,
        price: obj.finalPrice || obj.price,
      },
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
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
