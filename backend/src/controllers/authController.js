const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  validateRegisterInput,
  validateLoginInput,
  formatUserResponse,
} = require('../utils/validateAuth');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const validationError = validateRegisterInput({ name, email, password });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return res.status(201).json({
    message: 'User registered successfully',
    user: formatUserResponse(user),
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const validationError = validateLoginInput({ email, password });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    message: 'Login successful',
    user: formatUserResponse(user),
    token,
  });
};

module.exports = {
  register,
  login,
};
