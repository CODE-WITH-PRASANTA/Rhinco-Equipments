const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: 'Not Provided',
      trim: true,
    },
    productOrEquipment: {
      type: String,
      default: 'General Equipment',
      trim: true,
    },
    machineImage: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: String,
      default: '',
      trim: true,
    },
    enquiryType: {
      type: String,
      enum: ['Machinery Enquiry', 'Product Enquiry', 'Service Request', 'General Contact'],
      default: 'Machinery Enquiry',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
