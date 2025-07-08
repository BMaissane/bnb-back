// fixPastDates.ts
import { PrismaClient } from '@prisma/client';

(async () => {
  const prisma = new PrismaClient();
  const today = new Date();

  try {
    const result = await prisma.timeslot.updateMany({
      where: { date: { lt: today } },
      data: {
        date: today,
        start_at: new Date(today.setHours(12, 0, 0)),
        end_at: new Date(today.setHours(14, 0, 0))
      }
    });
    console.log(`Timeslots corrigés: ${result.count}`);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
})();