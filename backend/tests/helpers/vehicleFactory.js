const validVehicle = {
  make: 'Toyota',
  model: 'Camry',
  category: 'sedan',
  price: 25000,
  quantity: 5,
};

const buildVehiclePayload = (overrides = {}) => ({
  ...validVehicle,
  ...overrides,
});

module.exports = {
  validVehicle,
  buildVehiclePayload,
};
