const mongoose = require('mongoose');

const machinerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Machine title is required'],
      trim: true,
    },
    brandName: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    modelName: {
      type: String,
      default: '',
      trim: true,
    },
    implementType: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    implementPower: {
      type: String,
      default: '',
      trim: true,
    },
    powerRequirement: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount must be positive'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price must be positive'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    specification: {
      type: String,
      default: '',
      trim: true,
    },
    warranty: {
      type: String,
      default: '1 Year Standard',
      trim: true,
    },
    availableAtStore: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'Yes',
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold', 'On Order'],
      default: 'Available',
    },
    sponsored: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      trim: true,
    },
    enquiries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviews: {
      type: Number,
      default: 8,
    },
    machineImages: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    documents: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for frontend compatibility
machinerySchema.virtual('name').get(function () {
  return this.title;
});

machinerySchema.virtual('power').get(function () {
  return this.implementPower || this.powerRequirement || '35 - 50 HP';
});

machinerySchema.virtual('type').get(function () {
  return this.implementType || this.category || 'Farm Machinery';
});

machinerySchema.virtual('image').get(function () {
  if (Array.isArray(this.machineImages) && this.machineImages.length > 0) {
    const first = this.machineImages[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') return first.url || first.data || first.preview || '';
  }
  return '';
});

// Auto-sync brand & implementPower, and generate code
machinerySchema.pre('save', function () {
  if (!this.brand && this.brandName) {
    this.brand = this.brandName;
  }
  if (!this.brandName && this.brand) {
    this.brandName = this.brand;
  }
  if (!this.implementPower && this.powerRequirement) {
    this.implementPower = this.powerRequirement;
  }
  if (!this.powerRequirement && this.implementPower) {
    this.powerRequirement = this.implementPower;
  }
  if (!this.code) {
    this.code = `EQP-${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

module.exports = mongoose.model('Machinery', machinerySchema);
