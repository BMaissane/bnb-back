"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const client_1 = require("../prisma/client");
(0, dotenv_1.config)({ path: '.env.test' });
// Nettoyage avant les tests
beforeAll(async () => {
    await client_1.prisma.$connect();
});
// Nettoyage après les tests
afterAll(async () => {
    await client_1.prisma.$disconnect();
});
