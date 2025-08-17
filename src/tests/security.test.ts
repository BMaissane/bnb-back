import { describe, it, expect } from 'vitest';
import { validateUserInput, checkSQLInjection, sanitizeInput } from './securityUtils';


// 1. Test de validation des entrées utilisateur
describe('Input Validation', () => {
  it('should reject script tags in user input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    expect(validateUserInput(maliciousInput)).toBe(false);
  });

  it('should allow safe input', () => {
    const safeInput = 'Bonjour le monde';
    expect(validateUserInput(safeInput)).toBe(true);
  });
});

// 2. Test de détection d'injection SQL
describe('SQL Injection Detection', () => {
  it('should detect basic SQL injection', () => {
    const sqlInjection = "admin' OR '1'='1";
    expect(checkSQLInjection(sqlInjection)).toBe(true);
  });

  it('should pass safe SQL queries', () => {
    const safeQuery = "SELECT * FROM users WHERE id = 123";
    expect(checkSQLInjection(safeQuery)).toBe(false);
  });
});
