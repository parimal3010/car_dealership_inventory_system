const formatVehicleResponse = (vehicle) => ({
  id: vehicle._id.toString(),
  make: vehicle.make,
  model: vehicle.model,
  category: vehicle.category,
  price: vehicle.price,
  quantity: vehicle.quantity,
});

const validateVehicleInput = ({ make, model, category, price, quantity }) => {
  if (!make || !String(make).trim()) {
    return 'Make is required';
  }

  if (!model || !String(model).trim()) {
    return 'Model is required';
  }

  if (!category || !String(category).trim()) {
    return 'Category is required';
  }

  if (price === undefined || price === null) {
    return 'Price is required';
  }

  if (typeof price !== 'number' || price < 0) {
    return 'Price must be a positive number';
  }

  if (quantity === undefined || quantity === null) {
    return 'Quantity is required';
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return 'Quantity must be a positive number';
  }

  return null;
};

module.exports = {
  formatVehicleResponse,
  validateVehicleInput,
};
