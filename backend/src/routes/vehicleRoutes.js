const express = require('express');
const { createVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVehicle);

module.exports = router;
