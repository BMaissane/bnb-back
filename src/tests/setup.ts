// test/setup.ts
import { execSync } from 'child_process';
import { db } from './db';
import { beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL // Assurez-vous que c'est bien défini
})

beforeAll(async () => {
  console.log('Connexion DB:', await prisma.$queryRaw`SELECT 1`)
  await prisma.user.deleteMany()
})