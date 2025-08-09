"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("./prisma/client");
const helmet_1 = __importDefault(require("helmet"));
require("reflect-metadata");
const cors_1 = require("./middleware/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const reservation_1 = __importDefault(require("./routes/reservation"));
const menu_1 = __importDefault(require("./routes/menu"));
const item_1 = __importDefault(require("./routes/item"));
const timeslot_1 = __importDefault(require("./routes/timeslot"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const restaurant_1 = __importDefault(require("./routes/restaurant"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3600;
app.use(express_1.default.json());
// 1. Middlewares de sécurité
app.use((0, helmet_1.default)());
app.use(cors_1.corsMiddleware);
// 2. Body parsing (version simplifiée)
app.use(express_1.default.urlencoded({ extended: true }));
// 3. Logging des requêtes (version corrigée)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    next();
});
// 4. Prisma middleware (version corrigée)
app.use((req, res, next) => {
    res.on('finish', () => {
        client_1.prisma.$disconnect().catch(console.error);
    });
    next();
});
// Route test pour Jest
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// 5. Routes (version corrigée)
const restaurantParentRouter = express_1.default.Router({ mergeParams: true });
app.use('/api/restaurants/:restaurantId', restaurantParentRouter); // :restaurantId dynamique
restaurantParentRouter.use('/timeslots', timeslot_1.default); // Route imbriquée
app.use('/api/restaurants', restaurant_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/reservations', reservation_1.default);
app.use('/api/menu', menu_1.default);
app.use('/api/items', item_1.default);
app.use('/api/test', testRoutes_1.default);
// 6. Route racine
app.get('/', (req, res) => {
    res.send('API BookNBite');
});
// 7. Gestion des erreurs
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
