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

const buildSearchFilter = (query) => {
  const { make, model, category, minPrice, maxPrice } = query;
  const filter = {};

  if (make?.trim()) {
    filter.make = { $regex: make.trim(), $options: 'i' };
  }

  if (model?.trim()) {
    filter.model = { $regex: model.trim(), $options: 'i' };
  }

  if (category?.trim()) {
    filter.category = { $regex: category.trim(), $options: 'i' };
  }

  const hasMinPrice = minPrice !== undefined && minPrice !== '';
  const hasMaxPrice = maxPrice !== undefined && maxPrice !== '';

  if (hasMinPrice) {
    const min = Number(minPrice);
    if (Number.isNaN(min) || min < 0) {
      return { filter: null, error: 'minPrice must be a valid positive number' };
    }
  }

  if (hasMaxPrice) {
    const max = Number(maxPrice);
    if (Number.isNaN(max) || max < 0) {
      return { filter: null, error: 'maxPrice must be a valid positive number' };
    }
  }

  if (hasMinPrice && hasMaxPrice && Number(minPrice) > Number(maxPrice)) {
    return { filter: null, error: 'minPrice cannot be greater than maxPrice' };
  }

  if (hasMinPrice || hasMaxPrice) {
    filter.price = {};
    if (hasMinPrice) {
      filter.price.$gte = Number(minPrice);
    }
    if (hasMaxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  return { filter, error: null };
};

module.exports = {
  formatVehicleResponse,
  validateVehicleInput,
  buildSearchFilter,
};
