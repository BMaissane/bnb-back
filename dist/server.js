"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const app_1 = __importDefault(require("./app"));
const client_1 = require("./prisma/client");
const PORT = process.env.PORT || 3000;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
exports.server = server;
// Gestion propre de la fermeture
process.on('SIGTERM', () => {
    server.close(() => {
        client_1.prisma.$disconnect().finally(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});
