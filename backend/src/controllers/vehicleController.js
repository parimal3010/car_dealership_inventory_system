const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');
const {
  formatVehicleResponse,
  validateVehicleInput,
  buildSearchFilter,
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

const searchVehicles = async (req, res) => {
  const { filter, error } = buildSearchFilter(req.query);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

  return res.status(200).json({
    count: vehicles.length,
    vehicles: vehicles.map(formatVehicleResponse),
  });
};

const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { make, model, category, price, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  const validationError = validateVehicleInput({ make, model, category, price, quantity });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    { make, model, category, price, quantity },
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  return res.status(200).json({
    message: 'Vehicle updated successfully',
    vehicle: formatVehicleResponse(vehicle),
  });
};

module.exports = {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
};
