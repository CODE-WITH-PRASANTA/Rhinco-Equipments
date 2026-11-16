const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndPlaceOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

// Razorpay order creation
router.post('/razorpay-order', createRazorpayOrder);

// Razorpay payment verification and DB order placement
router.post('/verify-payment', verifyPaymentAndPlaceOrder);

// Admin get all successful orders
router.get('/', getAllOrders);

// Get single order
router.get('/:id', getOrderById);

// Admin update status
router.put('/:id/status', updateOrderStatus);

module.exports = router;
