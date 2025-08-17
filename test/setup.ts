// test/setup.ts
import { db } from './db';
import { beforeAll } from 'vitest';

beforeAll(() => {
  console.log('[DEBUG] DB utilisée :', process.env.DATABASE_URL);
});