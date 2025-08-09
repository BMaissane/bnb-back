"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemController_1 = require("../controllers/itemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkItemOwner_1 = require("../middleware/checkItemOwner");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), itemController_1.ItemController.createItem);
router.get('/:id', authMiddleware_1.authenticate, itemController_1.ItemController.getItemById);
// Routes dépendantes du restaurant_id
// PATCH /restaurants/:restaurantId/items/:itemId - Mise à jour item dans un restaurant spécifique
router.patch('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), checkItemOwner_1.checkItemOwner, itemController_1.ItemController.updateItem);
// DELETE /restaurants/:restaurantId/items/:itemId - Suppression item d'un restaurant
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), checkItemOwner_1.checkItemOwner, itemController_1.ItemController.deleteItem);
exports.default = router;
