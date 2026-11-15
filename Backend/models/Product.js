const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company / Brand name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    finalPrice: {
      type: Number,
      min: [0, 'Final price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      default: 1,
      min: [0, 'Stock cannot be negative'],
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviews: {
      type: Number,
      default: 12,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function () {
  if (!this.finalPrice && this.price) {
    const disc = this.discount || 0;
    this.finalPrice = Math.max(0, this.price - (this.price * disc) / 100);
  }
  if (!this.code) {
    this.code = `RHE-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (this.bestSeller && !this.badge) {
    this.badge = 'Best Seller';
  }
});

module.exports = mongoose.model('Product', productSchema);
