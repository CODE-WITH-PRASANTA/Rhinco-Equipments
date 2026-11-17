const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    productOrItem: {
      type: String,
      required: [true, 'Product or equipment name is required'],
      trim: true,
    },
    itemType: {
      type: String,
      enum: ['Product', 'Machinery', 'General Service'],
      default: 'Product',
    },
    rating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
      default: 5,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending',
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
