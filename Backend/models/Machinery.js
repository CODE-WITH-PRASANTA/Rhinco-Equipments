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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
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
    availableAtStore: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'Yes',
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
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
  }
);

// Auto-generate code if not provided
machinerySchema.pre('save', function () {
  if (!this.code) {
    this.code = `EQP-${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

module.exports = mongoose.model('Machinery', machinerySchema);
