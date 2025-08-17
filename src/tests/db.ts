import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ 
    log: ['query', 'info', 'warn', 'error']
  }) // affiche tous les log pour debug

export const db = {
  prisma,
  async clear() {
    // Logique pour nettoyer la base de données entre les tests
  }
}