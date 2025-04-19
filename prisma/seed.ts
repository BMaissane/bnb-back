// This is a file for testing data

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Créer un utilisateur owner
  const owner = await prisma.user.create({
    data: {
      type_user: 'RESTAURANT_OWNER',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'test3.dupont@example.com',
      password_hash: 'hashed_password_123'
    }
  })

  // 2. Créer un restaurant lié à l'owner
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Le Bistro Parisien',
      siret: '12345678901234',
      owner_id: owner.id,
      timeslot: {
        create: [
          {
            date: new Date('2025-07-15'),
            start_at: new Date('1970-01-01T19:00:00Z'),  // Time via Date
            end_at: new Date('1970-01-01T23:00:00Z'),
            capacity: 20
          }
        ]
      },
      menu: {
        create: {
          name: 'Menu Découverte',
          is_active: true,
          menu_has_item: {
            create: [
              {
                item: {
                  create: {
                    name: 'Soupe à l\'oignon',
                    category: 'STARTER',
                    base_price: 8.50
                  }
                }
              }
            ]
          }
        }
      }
    },
    include: {
      timeslot: true,
      menu: true
    }
  })

  console.log('Restaurant créé :', restaurant)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })