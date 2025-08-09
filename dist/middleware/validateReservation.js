"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateReservation = exports.validateCreateReservation = void 0;
const zod_1 = require("zod");
const reservationDto_1 = require("../interface/dto/reservationDto");
const validateCreateReservation = (req, res, next) => {
    try {
        reservationDto_1.createReservationSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                status: 'fail',
                error: error.errors,
            });
        }
        next(error);
    }
};
exports.validateCreateReservation = validateCreateReservation;
const validateUpdateReservation = (req, res, next) => {
    try {
        reservationDto_1.updateReservationSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                status: 'fail',
                error: error.errors,
            });
        }
        next(error);
    }
};
exports.validateUpdateReservation = validateUpdateReservation;
