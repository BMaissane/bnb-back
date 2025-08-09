"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const timeslotController_1 = require("../controllers/timeslotController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const checkOwner_1 = require("../middleware/checkOwner");
const timeslotValidation_1 = require("../middleware/timeslotValidation");
const router = express_1.default.Router({ mergeParams: true });
// Dans item.ts et timeslot.ts
router.use((req, res, next) => {
    console.log('Incoming params:', req.params); // Debug des paramètres
    next();
});
// Route pour les timeslots disponibles
router.get('/available', timeslotController_1.TimeslotController.getAvailable);
// 2. Route générale GET /timeslots
router.get('/', (req, res, next) => {
    console.log('Params:', req.params);
    next();
}, timeslotController_1.TimeslotController.getByRestaurant);
// 3. Toutes les autres routes avec paramètres
router.get('/:id', timeslotController_1.TimeslotController.getById);
router.patch('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('timeslot'), timeslotValidation_1.validateTimeslotDates, timeslotController_1.TimeslotController.update);
router.delete('/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), (0, checkOwner_1.checkOwnership)('timeslot'), timeslotController_1.TimeslotController.delete);
// 4. Route POST à la fin
router.post('/', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['RESTAURANT_OWNER']), 
// checkOwnership('restaurant'),
timeslotValidation_1.validateTimeslotDates, timeslotController_1.TimeslotController.createTimeslot);
exports.default = router;
