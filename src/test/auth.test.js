const { authenticate } = require('../../services/authService');
const { describe, it, expect } = require('@jest/globals');


 // Test UNITAIRE

describe('Auth Service', () => {
  it('should return user when password matches', async () => {
    // Teste uniquement la logique métier
    const user = await authenticate('valid@email.com', 'correctPwd');
    expect(user).toHaveProperty('id');
  });
});

// const { validateAuthInput } = require('./authHelpers');

// describe('Authentication Input Validation', () => {
//   // Cas valide
//   it('should accept valid email and password', () => {
//     const input = {
//       email: 'bon@exemple.com',
//       password: 'SecurePassword123!'
//     };
//     const result = validateAuthInput(input);
//     expect(result.isValid).toBe(true);
//     expect(result.errors).toEqual({});
//   });

//   // Cas invalides
//   describe('Invalid cases', () => {
//     it('should reject empty email', () => {
//       const input = {
//         email: '',
//         password: 'Password123'
//       };
//       const result = validateAuthInput(input);
//       expect(result.isValid).toBe(false);
//       expect(result.errors.email).toMatch('Email requis');
//     });

//     it('should reject invalid email format', () => {
//       const input = {
//         email: 'mauvais-email',
//         password: 'Password123'
//       };
//       const result = validateAuthInput(input);
//       expect(result.isValid).toBe(false);
//       expect(result.errors.email).toMatch('Email invalide');
//     });

//     it('should reject password that is too short', () => {
//       const input = {
//         email: 'bon@exemple.com',
//         password: '123'
//       };
//       const result = validateAuthInput(input);
//       expect(result.isValid).toBe(false);
//       expect(result.errors.password).toMatch('8 caractères minimum');
//     });

//     it('should reject password without numbers', () => {
//       const input = {
//         email: 'bon@exemple.com',
//         password: 'JustLetters!'
//       };
//       const result = validateAuthInput(input);
//       expect(result.isValid).toBe(false);
//       expect(result.errors.password).toMatch('Doit contenir un chiffre');
//     });

//     it('should reject password without special characters', () => {
//       const input = {
//         email: 'bon@exemple.com',
//         password: 'NoSpecial1'
//       };
//       const result = validateAuthInput(input);
//       expect(result.isValid).toBe(false);
//       expect(result.errors.password).toMatch('caractère spécial');
//     });
//   });
// });