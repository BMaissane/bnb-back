"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const reservationController_1 = require("../controllers/reservationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateReservation_1 = require("../middleware/validateReservation");
const checkOwner_1 = require("../middleware/checkOwner");
const router = (0, express_1.Router)();
// Middleware d'authentification global
router.use(authMiddleware_1.authenticate);
// CRUD des réservations
router.post('/', (0, authMiddleware_1.authorize)([client_1.UserType.CLIENT]), // Seuls les clients peuvent créer
validateReservation_1.validateCreateReservation, reservationController_1.ReservationController.create);
// GET BY ID FONCTIONNE POUR LES 2 TYPES D'USERS
router.get('/:id', authMiddleware_1.authenticate, reservationController_1.ReservationController.getById);
// GET TOUTES LES RESERVATIONS LIEES A UN USER
router.get('/user/:userId', (0, authMiddleware_1.authorize)([client_1.UserType.CLIENT, client_1.UserType.RESTAURANT_OWNER]), reservationController_1.ReservationController.getByUser);
// Seul le propriétaire peut voir les réservations de son restaurant
router.get('/restaurants/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('restaurant'), reservationController_1.ReservationController.getByRestaurant);
// Mettre à jour une réservation (statut OU informations)
router.patch('/:id', (0, authMiddleware_1.authorize)(['CLIENT']), (0, checkOwner_1.checkOwnership)('reservation'), reservationController_1.ReservationController.update);
// Annuler une réservation (version alternative)
router.patch('/:id/cancel', (0, authMiddleware_1.authorize)(['CLIENT', 'RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('reservation'), reservationController_1.ReservationController.cancel);
;
exports.default = router;
