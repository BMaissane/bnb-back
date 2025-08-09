"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("@/app"));
const client_1 = require("../prisma/client");
// Mock de Prisma
jest.mock('../prisma/client', () => ({
    prisma: {
        user: {
            create: jest.fn().mockResolvedValue({
                id: 1,
                email: 'test@test.com',
                first_name: 'Test'
            })
        }
    }
}));
describe('AuthController', () => {
    afterAll(async () => {
        await client_1.prisma.$disconnect();
    });
    it('POST /register should return 201', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/auth/register') // Vérifiez que c'est le bon endpoint
            .send({
            email: 'test@test.com',
            password: 'ValidPass123!',
            name: 'Test',
            isRestaurateur: false
        });
        expect(response.status).toBe(201);
    });
});
