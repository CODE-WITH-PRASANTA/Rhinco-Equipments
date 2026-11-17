const Review = require('../models/Review');

const initialReviews = [
  {
    customerName: 'Suresh Kumar Mohapatra',
    customerEmail: 'suresh.m@gmail.com',
    customerPhone: '+91 94370 12345',
    productOrItem: 'Rhinco Heavy Duty Rotavator 7 Feet',
    itemType: 'Machinery',
    rating: 5,
    title: 'Outstanding performance in wet paddy fields',
    comment: 'We purchased this rotavator for our farm in Kendrapara. It prepares the seedbed in a single pass with negligible tractor load. Highly recommend Rhinco machinery!',
    status: 'Approved',
    verifiedPurchase: true,
  },
  {
    customerName: 'Priyanka Das',
    customerEmail: 'priyanka.d@outlook.com',
    customerPhone: '+91 98611 67890',
    productOrItem: 'Fieldking Multi-Crop Thresher',
    itemType: 'Machinery',
    rating: 5,
    title: 'Very durable and low maintenance',
    comment: 'The multi-crop capability saves significant labor during harvest season. The delivery and on-site demonstration by the Rhinco team was seamless.',
    status: 'Approved',
    verifiedPurchase: true,
  },
  {
    customerName: 'Bikash Chandra Sahoo',
    customerEmail: 'bikash.sahoo@yahoo.com',
    customerPhone: '+91 98532 45678',
    productOrItem: 'Hydraulic Disc Harrow (16 Disc)',
    itemType: 'Product',
    rating: 4,
    title: 'Sturdy frame and excellent soil pulverization',
    comment: 'The boron steel discs penetrate hard dry soil effortlessly. Fuel consumption on our 55 HP tractor stayed optimal throughout the field operation.',
    status: 'Approved',
    verifiedPurchase: true,
  },
  {
    customerName: 'Manas Ranjan Nayak',
    customerEmail: 'manas.nayak@gmail.com',
    customerPhone: '+91 97780 98765',
    productOrItem: 'Shaktiman Semi Champion Rotavator',
    itemType: 'Machinery',
    rating: 5,
    title: 'Best value for money in Odisha',
    comment: 'Prompt delivery at Cuttack showroom. All spare parts and grease points are easily accessible. Great build quality.',
    status: 'Approved',
    verifiedPurchase: true,
  },
  {
    customerName: 'Anandita Roy',
    customerEmail: 'anandita.roy@gmail.com',
    customerPhone: '+91 91240 55443',
    productOrItem: 'Tractor Mounted Boom Sprayer',
    itemType: 'Product',
    rating: 4,
    title: 'Uniform spray coverage and reliable pressure pump',
    comment: 'Helped reduce chemical wastage by over 30%. Easy to operate and maintain.',
    status: 'Pending',
    verifiedPurchase: false,
  },
];

// @desc    Get all reviews
// @route   GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    // Seed initial reviews if collection is completely empty
    const count = await Review.countDocuments();
    if (count === 0) {
      await Review.insertMany(initialReviews);
    }

    const { status, rating, itemType, search, sort, productOrItem } = req.query;
    let query = {};

    if (status && status !== 'All Status' && status !== 'All') {
      query.status = status;
    }

    if (productOrItem && productOrItem.trim()) {
      // Escape special regex characters
      const escaped = productOrItem.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.productOrItem = { $regex: new RegExp(escaped, 'i') };
    }

    if (rating && rating !== 'All Ratings' && rating !== 'All' && !isNaN(Number(rating))) {
      query.rating = Number(rating);
    }

    if (itemType && itemType !== 'All Types' && itemType !== 'All') {
      query.itemType = itemType;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { customerName: { $regex: s, $options: 'i' } },
        { customerEmail: { $regex: s, $options: 'i' } },
        { productOrItem: { $regex: s, $options: 'i' } },
        { title: { $regex: s, $options: 'i' } },
        { comment: { $regex: s, $options: 'i' } },
      ];
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
      itemType,
      rating,
      title,
      comment,
      status,
      verifiedPurchase,
      avatar,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!productOrItem || !productOrItem.trim()) {
      return res.status(400).json({ success: false, message: 'Product or machinery name is required' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment is required' });
    }

    const numRating = rating !== undefined && !isNaN(Number(rating)) ? Number(rating) : 5;

    const newReview = await Review.create({
      customerName: customerName.trim(),
      customerEmail: (customerEmail || '').trim(),
      customerPhone: (customerPhone || '').trim(),
      productOrItem: productOrItem.trim(),
      itemType: itemType || 'Product',
      rating: Math.min(5, Math.max(1, numRating)),
      title: (title || '').trim(),
      comment: comment.trim(),
      status: status || 'Pending',
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
    if (productOrItem) review.productOrItem = productOrItem.trim();
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
