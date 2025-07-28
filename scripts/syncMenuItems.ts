import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncItemsToNewMenu(newMenuId: number) {
  try {
    // 1. Vérifier que le nouveau menu existe et obtenir le restaurant_id
    const newMenu = await prisma.menu.findUnique({
      where: { id: newMenuId },
      select: { restaurant_id: true }
    });

    if (!newMenu) {
      throw new Error(`Menu ${newMenuId} introuvable`);
    }

    // 2. Trouver tous les items du restaurant qui ne sont plus liés à aucun menu
    const orphanItems = await prisma.$queryRaw`
      SELECT i.id 
      FROM "item" i
      JOIN "restaurant_has_item" rhi ON i.id = rhi.item_id
      LEFT JOIN "menu_has_item" mhi ON i.id = mhi.item_id
      WHERE rhi.restaurant_id = ${newMenu.restaurant_id}
      AND mhi.menu_id IS NULL
    `;

    if (orphanItems.length === 0) {
      console.log("Aucun item orphelin trouvé pour ce restaurant");
      return;
    }

    // 3. Recréer les liaisons dans menu_has_item
    const result = await prisma.$transaction(async (tx) => {
      // Créer toutes les nouvelles associations
      const createdLinks = await tx.menu_has_item.createMany({
        data: orphanItems.map(item => ({
          menu_id: newMenuId,
          item_id: item.id
        })),
        skipDuplicates: true // Ignore si lien existe déjà
      });

      // Logging
      await tx.migrationLog.create({
        data: {
          operation: "SYNC_MENU_ITEMS",
          details: `Lié ${createdLinks.count} items au menu ${newMenuId}`,
          metadata: {
            newMenuId,
            restaurantId: newMenu.restaurant_id,
            itemIds: orphanItems.map(item => item.id)
          }
        }
      });

      return createdLinks;
    });

    console.log(`✅ ${result.count} items resynchronisés avec le menu ${newMenuId}`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution pour le nouveau menu ID 4
syncItemsToNewMenu(4).then(() => process.exit(0));