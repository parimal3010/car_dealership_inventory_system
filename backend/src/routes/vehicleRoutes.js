const express = require('express');
const {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, searchVehicles);
router.get('/', protect, getVehicles);
router.post('/', protect, createVehicle);
router.put('/:id', protect, updateVehicle);

module.exports = router;
