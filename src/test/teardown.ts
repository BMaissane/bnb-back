import prisma from "../prisma/client";
import { stopTestServer } from "./testUtils";

module.exports = async () => {
  await prisma.$disconnect();
};

module.exports = async () => {
  await stopTestServer();
};