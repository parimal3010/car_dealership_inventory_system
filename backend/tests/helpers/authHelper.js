const request = require('supertest');
const app = require('../../src/app');
const { buildUserPayload } = require('./userFactory');

const registerAndGetToken = async (overrides = {}) => {
  const payload = buildUserPayload(overrides);
  const response = await request(app).post('/api/auth/register').send(payload);

  return {
    token: response.body.token,
    user: response.body.user,
  };
};

module.exports = {
  registerAndGetToken,
};
