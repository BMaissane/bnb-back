import { prisma } from '../prisma/client';

jest.mock('../prisma/client', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(() => Promise.resolve()),
    user: {
      findUnique: jest.fn()
    }
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Nouvelle version simplifiée
  if (jest.isMockFunction(prisma.$disconnect)) {
    await prisma.$disconnect();
  }
});