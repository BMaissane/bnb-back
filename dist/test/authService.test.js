"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = require("../services/authService");
const mock_1 = require("./mock");
jest.mock('../prisma/client', () => ({
    prisma: {
        user: {
            create: jest.fn().mockResolvedValue(mock_1.mockUser),
            findUnique: jest.fn().mockResolvedValue(mock_1.mockUser)
        }
    }
}));
describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should register user with complete data', async () => {
        const result = await authService_1.AuthService.registerUser(mock_1.mockUser.email, 'ValidPass123!', mock_1.mockUser.first_name, false);
        expect(result).toEqual(expect.objectContaining({
            id: expect.any(Number),
            email: mock_1.mockUser.email,
            first_name: mock_1.mockUser.first_name
        }));
    });
});
