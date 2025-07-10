import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTimeslots() {
  try {
    const today = new Date();
    const dateOnly = new Date(today.setHours(0, 0, 0, 0));

    // 1. Correction des dates erronées
    const corrected = await prisma.$executeRaw`
      UPDATE "timeslot"
      SET 
        date = ${dateOnly},
        start_at = ${new Date(dateOnly.setHours(12, 0, 0))},
        end_at = ${new Date(dateOnly.setHours(14, 0, 0))},
        status = 'UNAVAILABLE'
      WHERE date < '1980-01-01' OR start_at < '1980-01-01'
    `;

    // 2. Marquer les timeslots passés
    const markedUnavailable = await prisma.$executeRaw`
      UPDATE "timeslot"
      SET status = 'UNAVAILABLE'
      WHERE date < ${new Date()}
      AND status != 'UNAVAILABLE'
    `;

    console.log(`
      Timeslots corrigés: ${corrected}
      Timeslots marqués UNAVAILABLE: ${markedUnavailable}
    `);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixTimeslots();