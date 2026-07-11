const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { buildVehiclePayload } = require('../helpers/vehicleFactory');
const { registerAndGetToken } = require('../helpers/authHelper');

describe('POST /api/vehicles', () => {
  const endpoint = '/api/vehicles';

  const createVehicle = (token, payload = buildVehiclePayload()) =>
    request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(payload);

  describe('successful creation', () => {
    it('should create a new vehicle and return 201', async () => {
      const { token } = await registerAndGetToken({ email: 'vehicle@example.com' });
      const payload = buildVehiclePayload();

      const response = await createVehicle(token, payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Vehicle created successfully');
      expect(response.body.vehicle).toMatchObject({
        make: payload.make,
        model: payload.model,
        category: payload.category,
        price: payload.price,
        quantity: payload.quantity,
      });
      expect(response.body.vehicle.id).toBeDefined();
    });

    it('should store the vehicle in the database', async () => {
      const { token } = await registerAndGetToken({ email: 'stored@example.com' });
      const payload = buildVehiclePayload({ make: 'Honda', model: 'Civic' });

      await createVehicle(token, payload);

      const vehiclesCollection = mongoose.connection.collection('vehicles');
      const storedVehicle = await vehiclesCollection.findOne({ make: 'Honda', model: 'Civic' });

      expect(storedVehicle).not.toBeNull();
      expect(storedVehicle.category).toBe(payload.category);
      expect(storedVehicle.price).toBe(payload.price);
      expect(storedVehicle.quantity).toBe(payload.quantity);
    });
  });

  describe('authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post(endpoint)
        .send(buildVehiclePayload());

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/not authorized/i);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await createVehicle('invalid-token', buildVehiclePayload());

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/not authorized/i);
    });
  });

  describe('validation errors', () => {
    let token;

    beforeEach(async () => {
      const auth = await registerAndGetToken({ email: `user-${Date.now()}@example.com` });
      token = auth.token;
    });

    it('should return 400 when make is missing', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ make: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/make/i);
    });

    it('should return 400 when model is missing', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ model: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/model/i);
    });

    it('should return 400 when category is missing', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ category: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/category/i);
    });

    it('should return 400 when price is missing', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ price: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/price/i);
    });

    it('should return 400 when quantity is missing', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ quantity: undefined }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/quantity/i);
    });

    it('should return 400 when price is negative', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ price: -100 }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/price/i);
    });

    it('should return 400 when quantity is negative', async () => {
      const response = await createVehicle(token, buildVehiclePayload({ quantity: -1 }));

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/quantity/i);
    });
  });
});
