const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    const {
      status,
      rating,
      itemType,
      search,
      sort,
      productOrItem,
      product,
      productName,
      productId,
    } = req.query;
    let query = {};

    if (status && status !== 'All Status' && status !== 'All') {
      query.status = status;
    }

    const targetProduct = (productOrItem || product || productName || '').trim();
    if (targetProduct && productId) {
      const escaped = targetProduct.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { productOrItem: { $regex: new RegExp(escaped, 'i') } },
        { productId: String(productId) },
      ];
    } else if (targetProduct) {
      const escaped = targetProduct.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.productOrItem = { $regex: new RegExp(escaped, 'i') };
    } else if (productId) {
      query.productId = String(productId);
    }

    if (rating && rating !== 'All Ratings' && rating !== 'All' && !isNaN(Number(rating))) {
      query.rating = Number(rating);
    }

    if (itemType && itemType !== 'All Types' && itemType !== 'All') {
      query.itemType = itemType;
    }

    if (search && search.trim()) {
      const s = search.trim();
      const searchConditions = [
        { customerName: { $regex: s, $options: 'i' } },
        { customerEmail: { $regex: s, $options: 'i' } },
        { productOrItem: { $regex: s, $options: 'i' } },
        { title: { $regex: s, $options: 'i' } },
        { comment: { $regex: s, $options: 'i' } },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'ratingHigh') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'ratingLow') {
      sortOption = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find(query).sort(sortOption);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error fetching review by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      productOrItem,
      productName,
      product,
      productId,
      itemType,
      rating,
      title,
      comment,
      status,
      verifiedPurchase,
      avatar,
    } = req.body;

    const targetItem = (productOrItem || productName || product || '').trim();

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!targetItem) {
      return res.status(400).json({ success: false, message: 'Product or machinery name is required' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    const numRating = rating !== undefined && !isNaN(Number(rating)) ? Number(rating) : 5;

    const newReview = await Review.create({
      productId: (productId || '').trim(),
      customerName: customerName.trim(),
      customerEmail: (customerEmail || '').trim(),
      customerPhone: (customerPhone || '').trim(),
      productOrItem: targetItem,
      itemType: itemType || 'Product',
      rating: Math.min(5, Math.max(1, numRating)),
      title: (title || '').trim(),
      comment: comment.trim(),
      status: status || 'Approved',
      verifiedPurchase: verifiedPurchase !== undefined ? Boolean(verifiedPurchase) : true,
      avatar: avatar || '',
    });

    res.status(201).json({
      success: true,
      message: 'Review saved successfully in database',
      data: newReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      productOrItem,
      productName,
      product,
      productId,
      itemType,
      rating,
      title,
      comment,
      status,
      verifiedPurchase,
      avatar,
    } = req.body;

    if (customerName) review.customerName = customerName.trim();
    if (customerEmail !== undefined) review.customerEmail = customerEmail.trim();
    if (customerPhone !== undefined) review.customerPhone = customerPhone.trim();
    const targetItem = (productOrItem || productName || product || '').trim();
    if (targetItem) review.productOrItem = targetItem;
    if (productId !== undefined) review.productId = String(productId).trim();
    if (itemType) review.itemType = itemType;
    if (rating !== undefined && !isNaN(Number(rating))) {
      review.rating = Math.min(5, Math.max(1, Number(rating)));
    }
    if (title !== undefined) review.title = title.trim();
    if (comment) review.comment = comment.trim();
    if (status) review.status = status;
    if (verifiedPurchase !== undefined) review.verifiedPurchase = Boolean(verifiedPurchase);
    if (avatar !== undefined) review.avatar = avatar;

    const updated = await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully in database',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully from database',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
