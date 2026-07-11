const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { buildUserPayload } = require('../helpers/userFactory');

describe('POST /api/auth/register', () => {
  const endpoint = '/api/auth/register';

  describe('successful registration', () => {
    it('should register a new user and return 201', async () => {
      const payload = buildUserPayload();

      const response = await request(app).post(endpoint).send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toMatchObject({
        name: payload.name,
        email: payload.email,
        role: 'user',
      });
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('should store the user in the database with a hashed password', async () => {
      const payload = buildUserPayload({ email: 'hashed@example.com' });

      await request(app).post(endpoint).send(payload);

      const usersCollection = mongoose.connection.collection('users');
      const storedUser = await usersCollection.findOne({ email: payload.email });

      expect(storedUser).not.toBeNull();
      expect(storedUser.name).toBe(payload.name);
      expect(storedUser.password).not.toBe(payload.password);
      expect(storedUser.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('validation errors', () => {
    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post(endpoint)
        .send(buildUserPayload({ name: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/name/i);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post(endpoint)
        .send(buildUserPayload({ email: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post(endpoint)
        .send(buildUserPayload({ password: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/password/i);
    });

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post(endpoint)
        .send(buildUserPayload({ email: 'not-an-email' }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email/i);
    });

    it('should return 400 when password is too short', async () => {
      const response = await request(app)
        .post(endpoint)
        .send(buildUserPayload({ password: '12345' }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/password/i);
    });
  });

  describe('duplicate registration', () => {
    it('should return 409 when email is already registered', async () => {
      const payload = buildUserPayload({ email: 'duplicate@example.com' });

      await request(app).post(endpoint).send(payload);

      const response = await request(app).post(endpoint).send(payload);

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists|already registered/i);
    });
  });
});
