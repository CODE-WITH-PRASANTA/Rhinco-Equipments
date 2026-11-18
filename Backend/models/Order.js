const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: 'Farm Delivery' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay Online',
    },
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Pending',
        'Confirmed',
        'Processing',
        'Dispatched',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Processing',
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    user: {
      userId: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [val => val.length > 0, 'Order must contain at least one product'],
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: String,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
