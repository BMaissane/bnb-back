import { prisma } from '../prisma/client';
import { stopTestServer } from './testUtils';

jest.mock('../prisma/client', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(() => Promise.resolve()),
    user: {
      findUnique: jest.fn()
    }
  }
}));

beforeEach(async () => {
  await stopTestServer(); // Nettoyage entre chaque test
});

afterAll(async () => {
  await stopTestServer(); // Nettoyage final
}, 1000);