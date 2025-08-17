// test/debug.test.ts
import { it } from 'vitest';
import { db } from './db';

it('debug: check users in DB', async () => {
  const users = await db.prisma.user.findMany();
  console.log('Users in DB:', users); // Affiche les données dans la console
});