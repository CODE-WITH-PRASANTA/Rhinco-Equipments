const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndPlaceOrder,
  createDirectOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

// Direct order creation (COD or standard API placement)
router.post('/', createDirectOrder);

// Razorpay order creation
router.post('/razorpay-order', createRazorpayOrder);
router.post('/razorpay', createRazorpayOrder);

// Razorpay payment verification and DB order placement
router.post('/verify-payment', verifyPaymentAndPlaceOrder);
router.post('/verify', verifyPaymentAndPlaceOrder);

// Admin get all successful orders
router.get('/', getAllOrders);

// Get single order
router.get('/:id', getOrderById);

// Admin update status
router.put('/:id/status', updateOrderStatus);
router.put('/:id', updateOrderStatus);

module.exports = router;
