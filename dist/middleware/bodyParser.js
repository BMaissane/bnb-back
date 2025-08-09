"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlencodedParser = exports.jsonParser = void 0;
const express_1 = require("express");
// Configuration typée pour body-parser
const jsonOptions = {
    limit: '10mb'
};
const urlencodedOptions = {
    extended: true,
    parameterLimit: 10000
};
exports.jsonParser = (0, express_1.json)(jsonOptions);
exports.urlencodedParser = (0, express_1.urlencoded)(urlencodedOptions);
