"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Register
router.post('/register', authController_1.registerUser);
// Login
router.post('/login', authController_1.loginUser);
// New password/ Forgotten Password
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password', authController_1.resetPassword);
// Route for restaurant_owner
router.get('/restaurant', authMiddleware_1.authenticate, (req, res) => {
    res.json({ message: 'Espace restaurateur' });
});
exports.default = router;
