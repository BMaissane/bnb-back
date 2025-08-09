"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restaurantController_1 = require("../controllers/restaurantController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkOwner_1 = require("../middleware/checkOwner");
const restaurantRouter = express_1.default.Router();
// Public routes
restaurantRouter.get('/', restaurantController_1.RestaurantController.getAllRestaurants);
restaurantRouter.get('/search', restaurantController_1.RestaurantController.search);
restaurantRouter.get('/:id', restaurantController_1.RestaurantController.getById);
// Protected routes (require authentication)
restaurantRouter.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), restaurantController_1.RestaurantController.create);
restaurantRouter.get('/owner/:ownerId', authMiddleware_1.authenticate, restaurantController_1.RestaurantController.getRestaurantsByOwner);
restaurantRouter.patch('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('restaurant'), restaurantController_1.RestaurantController.update);
restaurantRouter.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('restaurant'), restaurantController_1.RestaurantController.delete);
exports.default = restaurantRouter;
