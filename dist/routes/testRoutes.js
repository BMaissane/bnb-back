"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// testRoutes.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Middleware pour logger les requêtes
router.use((req, res, next) => {
    console.log(`[TEST] ${req.method} ${req.path}`, req.body);
    next();
});
// Route GET (plus simple à tester)
router.get('/test-get', (req, res) => {
    res.status(200).json({ message: 'GET test OK', body: req.body });
});
// Route POST (comme dans votre exemple)
router.post('/test-post', (req, res) => {
    res.status(200).json({ message: 'POST test OK', body: req.body });
});
exports.default = router;
