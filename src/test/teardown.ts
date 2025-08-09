import prisma from "../prisma/client";

module.exports = async () => {
  await prisma.$disconnect();
};