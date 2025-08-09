"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const userDto_1 = require("../interface/dto/userDto");
const validate_1 = require("../middleware/validate");
const checkOwner_1 = require("../middleware/checkOwner");
const router = (0, express_1.Router)();
// POST /users - Création utilisateur (public)
router.post('/', userController_1.createUser);
// GET /users/:id - Récupération profil (authentifié)
router.get('/:id', authMiddleware_1.authenticate, userController_1.getUserById);
// PUT/UPDATE /users/:id - Modification (authentifié)
// Dans user.ts (routes)
router.put('/:id', authMiddleware_1.authenticate, (0, checkOwner_1.checkOwnership)('user'), (0, validate_1.validate)(userDto_1.UpdateUserSchema), userController_1.updateUser);
// DELETE /users/:id - Suppression & confirmation via mot de passe
router.delete('/:id', authMiddleware_1.authenticate, (0, checkOwner_1.checkOwnership)('user'), userController_1.deleteUser);
exports.default = router;
