import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const restaurants = await prisma.restaurant.findMany()
    console.log("Restaurants trouvés :", restaurants)
  } catch (error) {
    console.error("Erreur :", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()