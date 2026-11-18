const express = require('express');
const router = express.Router();
const {
  createMachineryOrder,
  getMachineryOrders,
  getMachineryOrderById,
  updateMachineryOrder,
  deleteMachineryOrder,
} = require('../controllers/machineryOrderController');

router.route('/')
  .get(getMachineryOrders)
  .post(createMachineryOrder);

router.route('/:id')
  .get(getMachineryOrderById)
  .put(updateMachineryOrder)
  .delete(deleteMachineryOrder);

module.exports = router;
