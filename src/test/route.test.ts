import express, { Router } from 'express';
import request from 'supertest';
import app from '../app';

import {expect, describe, it, jest, test} from '@jest/globals';

describe('GET /api/auth', () => {
  it('should return 200', async () => {
    const response = await request(app)
      .get('/api/auth')
      .expect(200);

    expect(response.body).toEqual({ status: 'OK' });
  });
});