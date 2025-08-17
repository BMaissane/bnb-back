import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../app';
import prisma from '../prisma/client';

describe('Sécurité Auth', () => {
  it('POST /login - bloque les tentatives d\'injection SQL', async () => {
    const payloads = [
      // Classique
      { email: "' OR '1'='1", password: "anything" },
      // Version encodée
      { email: "%27%20OR%20%271%27%3D%271", password: "hack" }
    ];

    for (const payload of payloads) {
      const res = await request(app)
        .post('/api/auth/login')
        .send(payload);
      
      // Vérifiez que le serveur ne crash pas et renvoie une erreur propre
      expect(res.status).not.toBe(500); // Si 500 → vulnérable
      expect(res.body.error).not.toMatch(/SQL/gi); // Ne pas fuiter d'infos
    }
  });

  it('POST /login - erreur 400 sur input malformé', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ 
      email: { $ne: "" }, // Payload NoSQL
      password: { $gt: "" }
    });
  
  expect(res.status).toBe(400); // trigger validation zod
});

// it("POST /login - rate limiting après 5 tentatives", async () => {
//   for (let i = 0; i < 6; i++) {
//     const res = await request(app)
//       .post("/api/auth/login")
//       .send({ email: "hacker@test.com", password: "Qw5gs5F3K" });
//     if (i >= 5) expect(res.status).toBe(429); // HTTP 429 = Too Many Requests 
//   }
// });

// it('POST /register - bloque les injections SQL', async () => {
//   const testPayload = '%27%20OR%20%271%27%3D%271'; // ' OR '1'='1
  
//   const res = await request(app)
//     .post('/api/auth/register')
//     .send({
//       email: testPayload,
//       password: 'ValidPass123!',
//       name: testPayload,
//       lastName: testPayload,
//       isRestaurateur: false
//     });

// //  Vérifications améliorées
//   expect(res.status).not.toBe(500); // Le serveur ne crash pas
  
// //  Correction : Convertir l'objet en string pour .toMatch()
//   expect(JSON.stringify(res.body)).not.toMatch(/SQL|syntax|error/gi); // Pas de fuite d'infos
  
// //  Accepte soit un rejet (400) soit une neutralisation (201)
//   if (res.status === 201) {
//     const user = await prisma.user.findUnique({
//       where: { email: testPayload }
//     });
//     expect(user?.email).not.toContain("'"); // Neutralisation vérifiée
//   } else {
//     expect(res.status).toBe(400); // Erreur de validation attendue
//   }
// });
});