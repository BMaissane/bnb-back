"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menuController_1 = require("../controllers/menuController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkOwner_1 = require("../middleware/checkOwner");
const router = express_1.default.Router();
// Routes publiques
router.get('/:id', menuController_1.menuController.getMenuById); // GET /api/menu/10
router.get('/restaurants/:id', menuController_1.menuController.getMenusByRestaurant);
// Routes protégées
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('menu'), menuController_1.menuController.createMenu);
router.put('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('menu'), menuController_1.menuController.updateMenu);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('menu'), menuController_1.menuController.deleteMenu);
exports.default = router;
