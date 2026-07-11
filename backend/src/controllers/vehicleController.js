const Vehicle = require('../models/Vehicle');
const {
  formatVehicleResponse,
  validateVehicleInput,
} = require('../utils/validateVehicle');

const createVehicle = async (req, res) => {
  const { make, model, category, price, quantity } = req.body;

  const validationError = validateVehicleInput({ make, model, category, price, quantity });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const vehicle = await Vehicle.create({ make, model, category, price, quantity });

  return res.status(201).json({
    message: 'Vehicle created successfully',
    vehicle: formatVehicleResponse(vehicle),
  });
};

const getVehicles = async (_req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });

  return res.status(200).json({
    count: vehicles.length,
    vehicles: vehicles.map(formatVehicleResponse),
  });
};

module.exports = {
  createVehicle,
  getVehicles,
};
