
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function linkExistingItemsToMenu() {
  const RESTAURANT_ID = 1;
  const MENU_ID = 1;

  // 1. Vérifier que le menu appartient bien au restaurant
  const menu = await prisma.menu.findUnique({
    where: { id: MENU_ID },
    select: { restaurant_id: true }
  });

  if (!menu || menu.restaurant_id !== RESTAURANT_ID) {
    throw new Error('Menu invalide ou ne correspond pas au restaurant');
  }

  // 2. Récupérer tous les items du restaurant 1 non liés au menu 1
  const itemsToLink = await prisma.restaurant_has_item.findMany({
    where: {
      restaurant_id: RESTAURANT_ID,
      item: {
        menu_has_item: {
          none: { menu_id: MENU_ID }
        }
      }
    },
    select: { item_id: true }
  });

  // 3. Créer les liaisons manquantes
  const result = await prisma.menu_has_item.createMany({
    data: itemsToLink.map(({ item_id }) => ({
      menu_id: MENU_ID,
      item_id
    })),
    skipDuplicates: true
  });

  console.log(`${result.count} items rattachés au menu ${MENU_ID}`);
}

linkExistingItemsToMenu()
  .catch(console.error)
  .finally(() => prisma.$disconnect());