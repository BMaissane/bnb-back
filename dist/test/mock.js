"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUser = void 0;
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
exports.mockUser = {
    id: faker_1.faker.number.int(),
    email: faker_1.faker.internet.email(),
    first_name: faker_1.faker.person.firstName(),
    last_name: null,
    phone_number: null,
    type_user: client_1.UserType.CLIENT,
    password_hash: faker_1.faker.string.uuid(),
    resetToken: null,
    created_at: faker_1.faker.date.recent(),
    updated_at: faker_1.faker.date.recent()
};
