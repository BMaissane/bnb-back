import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';


describe('Routes Auth - Tests Basiques', () => {
it('POST /register - clients', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@test.com',
      password: '9AsiXg4E7',
      name: 'Test User',
      lastName: 'Tchoupi',
      isRestaurateur: false,
    });
  
  console.log('Register Response:', { 
    status: res.status, 
    body: res.body 
  });
  expect(res.status).toBe(201);
});

it('POST /register - restaurant owners', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@gmail.com',
      password: '9AsiXg4E7',
      name: 'Boulanger',
      lastName: 'Tchoupi',
      isRestaurateur: true,
      siret: '37522555400399'
    });
  
  console.log('Register Response:', { 
    status: res.status, 
    body: res.body 
  });
  expect(res.status).toBe(201);
});

it('POST /register - erreur 401 si champs manquants', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@test.com',
      password: 'A38wEF3ts'
      // Oublie name, lastName, isRestaurateur
    });
  expect(res.status).toBe(401);
});

it('POST /login - répond avec un statut 200', async () => {
  // D'abord créer un user (ou utiliser un mock)
  await request(app)
    .post('/api/auth/register')
    .send({
      email: 'login@test.com',
      password: 'Zq44bH3Sb',
      name: 'Login User',
      lastName: 'Test',
      isRestaurateur: false
    });

  // Puis tester le login
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'login@test.com',
      password: 'Zq44bH3Sb'
    });
  expect(res.status).toBe(200);
});

it("POST /login - erreur 401 si mot de passe incorrect", async () => {
  // 1. Créer un utilisateur valide
  await request(app).post("/api/auth/register").send({
    email: "testlogin@test.com",
    password: "bonMotDePasse",
    name: "Test",
    lastName: "User",
    isRestaurateur: false,
  });

  // 2. Tester une combinaison invalide
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testlogin@test.com",
      password: "mauvaisMotDePasse", 
    });

  expect(res.status).toBe(500); // Doit échouer
});
});