"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.message = message;
        this.details = details;
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}
exports.HttpException = HttpException;
