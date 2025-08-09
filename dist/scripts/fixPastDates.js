"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/fixPastDates.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixPastDates() {
    // 1. Obtenir la date/heure actuelle
    const now = new Date();
    console.log(`🕒 Date de référence : ${now.toISOString()}`);
    // 2. Trouver tous les timeslots passés non corrigés
    const pastSlots = await prisma.timeslot.findMany({
        where: {
            start_at: { lt: now }, // "lt" = less than (avant la date actuelle)
            status: { not: 'UNAVAILABLE' } // On ne corrige que ceux qui ne sont pas déjà marqués
        },
        select: {
            id: true,
            start_at: true,
            status: true
        }
    });
    console.log(`🔍 ${pastSlots.length} créneaux à corriger`);
    if (pastSlots.length === 0) {
        console.log('✅ Rien à corriger');
        return;
    }
    // 3. Afficher un échantillon pour vérification
    console.log('\nExemple de créneaux à corriger :');
    pastSlots.slice(0, 5).forEach(slot => {
        console.log(`- ID: ${slot.id} | Début: ${slot.start_at} | Statut: ${slot.status}`);
    });
    // 4. Mise à jour en une seule opération
    const { count } = await prisma.timeslot.updateMany({
        where: {
            id: { in: pastSlots.map(slot => slot.id) } // On cible seulement les IDs trouvés
        },
        data: {
            status: 'UNAVAILABLE',
            updated_at: now
        }
    });
    // 5. Résumé des modifications
    console.log(`\n🎉 ${count} créneaux corrigés :`);
    console.log(`- Nouveau statut : UNAVAILABLE`);
    console.log(`- Date de mise à jour : ${now.toISOString()}`);
}
fixPastDates()
    .catch(e => {
    console.error('❌ Erreur :', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
