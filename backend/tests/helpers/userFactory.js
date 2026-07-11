const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
};

const buildUserPayload = (overrides = {}) => ({
  ...validUser,
  ...overrides,
});

module.exports = {
  validUser,
  buildUserPayload,
};
