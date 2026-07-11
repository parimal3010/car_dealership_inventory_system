const express = require('express');
const { createVehicle, getVehicles } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getVehicles);
router.post('/', protect, createVehicle);

module.exports = router;
