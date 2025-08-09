"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMockEmail = sendMockEmail;
// Pour éviter de configurer un vrai SMTP en développement
function sendMockEmail(to, content) {
    console.log(`[EMAIL MOCK] À: ${to}\nContenu: ${content}`);
}
