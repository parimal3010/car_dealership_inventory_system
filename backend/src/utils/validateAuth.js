const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => EMAIL_REGEX.test(email);

const validateRegisterInput = ({ name, email, password }) => {
  if (!name || !name.trim()) {
    return 'Name is required';
  }

  if (!email || !email.trim()) {
    return 'Email is required';
  }

  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }

  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }

  if (!password) {
    return 'Password is required';
  }

  return null;
};

const formatUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  formatUserResponse,
};
