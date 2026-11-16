const express = require('express');
const router = express.Router();
const {
  getMachineries,
  getMachineryById,
  createMachinery,
  updateMachinery,
  deleteMachinery,
} = require('../controllers/machineryController');

router.route('/')
  .get(getMachineries)
  .post(createMachinery);

router.route('/:id')
  .get(getMachineryById)
  .put(updateMachinery)
  .delete(deleteMachinery);

module.exports = router;
