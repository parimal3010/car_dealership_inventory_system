const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { buildUserPayload } = require('../helpers/userFactory');

describe('POST /api/auth/login', () => {
  const registerEndpoint = '/api/auth/register';
  const loginEndpoint = '/api/auth/login';

  const registerUser = (overrides = {}) =>
    request(app).post(registerEndpoint).send(buildUserPayload(overrides));

  describe('successful login', () => {
    it('should login with valid credentials and return 200', async () => {
      const payload = buildUserPayload({ email: 'login@example.com' });
      await registerUser(payload);

      const response = await request(app).post(loginEndpoint).send({
        email: payload.email,
        password: payload.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toMatchObject({
        name: payload.name,
        email: payload.email,
        role: 'user',
      });
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');

      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(response.body.user.id);
    });
  });

  describe('authentication errors', () => {
    it('should return 401 for non-existent email', async () => {
      const response = await request(app).post(loginEndpoint).send({
        email: 'missing@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });

    it('should return 401 for incorrect password', async () => {
      const payload = buildUserPayload({ email: 'wrongpass@example.com' });
      await registerUser(payload);

      const response = await request(app).post(loginEndpoint).send({
        email: payload.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe('validation errors', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app).post(loginEndpoint).send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app).post(loginEndpoint).send({
        email: 'user@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/password/i);
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app).post(loginEndpoint).send({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
    });
  });
});
