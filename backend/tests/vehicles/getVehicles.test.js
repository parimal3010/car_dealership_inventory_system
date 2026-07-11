const request = require('supertest');
const app = require('../../src/app');
const { buildVehiclePayload } = require('../helpers/vehicleFactory');
const { registerAndGetToken } = require('../helpers/authHelper');

describe('GET /api/vehicles', () => {
  const endpoint = '/api/vehicles';

  const createVehicle = (token, payload) =>
    request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(payload);

  const getVehicles = (token) =>
    request(app).get(endpoint).set('Authorization', `Bearer ${token}`);

  describe('successful retrieval', () => {
    it('should return 200 with an empty list when no vehicles exist', async () => {
      const { token } = await registerAndGetToken({ email: 'empty@example.com' });

      const response = await getVehicles(token);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.vehicles).toEqual([]);
    });

    it('should return all vehicles with correct fields', async () => {
      const { token } = await registerAndGetToken({ email: 'list@example.com' });

      const toyota = buildVehiclePayload({ make: 'Toyota', model: 'Camry' });
      const honda = buildVehiclePayload({ make: 'Honda', model: 'Civic', quantity: 0 });

      await createVehicle(token, toyota);
      await createVehicle(token, honda);

      const response = await getVehicles(token);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.vehicles).toHaveLength(2);
      expect(response.body.vehicles[0]).toMatchObject({
        make: honda.make,
        model: honda.model,
        category: honda.category,
        price: honda.price,
        quantity: honda.quantity,
      });
      expect(response.body.vehicles[0].id).toBeDefined();
      expect(response.body.vehicles[1]).toMatchObject({
        make: toyota.make,
        model: toyota.model,
        category: toyota.category,
        price: toyota.price,
        quantity: toyota.quantity,
      });
    });
  });

  describe('authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/not authorized/i);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await getVehicles('invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/not authorized/i);
    });
  });
});
