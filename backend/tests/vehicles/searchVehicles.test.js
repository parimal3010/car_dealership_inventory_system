const request = require('supertest');
const app = require('../../src/app');
const { buildVehiclePayload } = require('../helpers/vehicleFactory');
const { registerAndGetToken } = require('../helpers/authHelper');

describe('GET /api/vehicles/search', () => {
  const vehiclesEndpoint = '/api/vehicles';
  const searchEndpoint = '/api/vehicles/search';

  const createVehicle = (token, payload) =>
    request(app)
      .post(vehiclesEndpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

  const searchVehicles = (token, query = {}) =>
    request(app)
      .get(searchEndpoint)
      .set('Authorization', `Bearer ${token}`)
      .query(query);

  const seedVehicles = async (token) => {
    await createVehicle(
      token,
      buildVehiclePayload({ make: 'Toyota', model: 'Camry', category: 'sedan', price: 25000 })
    );
    await createVehicle(
      token,
      buildVehiclePayload({ make: 'Honda', model: 'Civic', category: 'sedan', price: 22000 })
    );
    await createVehicle(
      token,
      buildVehiclePayload({ make: 'Ford', model: 'F-150', category: 'truck', price: 45000 })
    );
  };

  describe('successful search', () => {
    let token;

    beforeEach(async () => {
      const auth = await registerAndGetToken({ email: `search-${Date.now()}@example.com` });
      token = auth.token;
      await seedVehicles(token);
    });

    it('should return all vehicles when no filters are provided', async () => {
      const response = await searchVehicles(token);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.vehicles).toHaveLength(3);
    });

    it('should search by make (case-insensitive partial match)', async () => {
      const response = await searchVehicles(token, { make: 'toy' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.vehicles[0].make).toBe('Toyota');
    });

    it('should search by model (case-insensitive partial match)', async () => {
      const response = await searchVehicles(token, { model: 'civ' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.vehicles[0].model).toBe('Civic');
    });

    it('should search by category', async () => {
      const response = await searchVehicles(token, { category: 'truck' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.vehicles[0].category).toBe('truck');
    });

    it('should search by minimum price', async () => {
      const response = await searchVehicles(token, { minPrice: 30000 });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.vehicles[0].make).toBe('Ford');
    });

    it('should search by maximum price', async () => {
      const response = await searchVehicles(token, { maxPrice: 23000 });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.vehicles[0].make).toBe('Honda');
    });

    it('should search by price range', async () => {
      const response = await searchVehicles(token, { minPrice: 20000, maxPrice: 26000 });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.vehicles.map((vehicle) => vehicle.make).sort()).toEqual(['Honda', 'Toyota']);
    });

    it('should combine multiple filters', async () => {
      const response = await searchVehicles(token, {
        make: 'Honda',
        category: 'sedan',
        minPrice: 20000,
        maxPrice: 25000,
      });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.vehicles[0]).toMatchObject({
        make: 'Honda',
        model: 'Civic',
        category: 'sedan',
        price: 22000,
      });
    });

    it('should return an empty list when no vehicles match', async () => {
      const response = await searchVehicles(token, { make: 'BMW' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.vehicles).toEqual([]);
    });
  });

  describe('validation errors', () => {
    let token;

    beforeEach(async () => {
      const auth = await registerAndGetToken({ email: `validate-${Date.now()}@example.com` });
      token = auth.token;
    });

    it('should return 400 when minPrice is invalid', async () => {
      const response = await searchVehicles(token, { minPrice: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/minPrice/i);
    });

    it('should return 400 when maxPrice is invalid', async () => {
      const response = await searchVehicles(token, { maxPrice: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/maxPrice/i);
    });

    it('should return 400 when minPrice is greater than maxPrice', async () => {
      const response = await searchVehicles(token, { minPrice: 50000, maxPrice: 20000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/minPrice cannot be greater than maxPrice/i);
    });
  });

  describe('authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get(searchEndpoint);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/not authorized/i);
    });

    it('should return 401 when token is invalid', async () => {
      const response = await searchVehicles('invalid-token', { make: 'Toyota' });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/not authorized/i);
    });
  });
});
