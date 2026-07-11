const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  it('GET /api/health should return status ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Car Dealership API is running',
    });
  });
});
