const express = require('express');
const {
  createVehicle,
  getVehicles,
  searchVehicles,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, searchVehicles);
router.get('/', protect, getVehicles);
router.post('/', protect, createVehicle);

module.exports = router;
