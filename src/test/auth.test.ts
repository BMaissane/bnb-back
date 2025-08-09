import request from 'supertest';
import { startTestServer, stopTestServer } from './testUtils';
import app from '../app';

describe('Auth Route Accessibility', () => {
  beforeAll(async () => {
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
  });

  it('GET /auth should return 404', async () => {
    const res = await request(app).get('/auth');
    expect(res.status).toBe(404);
  });
});