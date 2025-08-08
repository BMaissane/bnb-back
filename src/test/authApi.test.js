const request = require('supertest');
const app = require('../../app');
const { describe, it, expect } = require('@jest/globals');

describe('Auth API', () => {
  it('POST /login should return token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'GoodPass123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});