import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
        setupFiles: ['./src/tests/setup.ts'],
    env: {
      TEST_DATABASE_URL: process.env.DATABASE_URL_TEST 
    }
  },
  resolve: {
    alias: {
      auth: '/src/auth',
      quotes: '/src/quotes',
      lib: '/src/lib'
    }
  }
})
