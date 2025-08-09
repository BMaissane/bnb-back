"use strict";
// Gestion des opening hours restaurant au format JSON avec validation ZOD
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleHours = void 0;
// Exemple type :
exports.exampleHours = {
    monday: [
        { open: "11:00", close: "14:00" },
        { open: "18:00", close: "22:00" }
    ],
    tuesday: [], // Fermé toute la journée
    saturday: [
        { open: "11:00", close: "23:00" } // Service continu
    ]
};
