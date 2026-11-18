const mongoose = require('mongoose');

const machineryOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    district: {
      type: String,
      default: '',
      trim: true,
    },
    village: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
    },
    machineId: {
      type: String,
      default: '',
      trim: true,
    },
    machineName: {
      type: String,
      required: [true, 'Machine / Equipment name is required'],
      trim: true,
    },
    productOrEquipment: {
      type: String,
      default: '',
      trim: true,
    },
    brand: {
      type: String,
      default: 'Rhinco',
      trim: true,
    },
    category: {
      type: String,
      default: 'Farm Machinery',
      trim: true,
    },
    modelName: {
      type: String,
      default: '',
      trim: true,
    },
    power: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: String,
      default: '',
      trim: true,
    },
    machineImage: {
      type: String,
      default: '',
      trim: true,
    },
    intent: {
      type: String,
      default: 'Price Quotation',
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Pending', 'Resolved', 'Closed'],
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderId if not provided
machineryOrderSchema.pre('save', function (next) {
  if (!this.orderId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `MCH-${Date.now().toString().slice(-6)}-${randomSuffix}`;
  }
  if (!this.productOrEquipment) {
    this.productOrEquipment = this.machineName;
  }
  if (typeof next === 'function') {
    return next();
  }
});

module.exports = mongoose.model('MachineryOrder', machineryOrderSchema);
