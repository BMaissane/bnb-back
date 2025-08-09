"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
exports.validate = validate;
