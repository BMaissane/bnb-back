// Fonction de validation d'entrée
export function validateUserInput(input: string) {
  const xssPattern = /<script.*?>.*?<\/script>/gi;
  return !xssPattern.test(input);
}

// Détection d'injection SQL basique
export function checkSQLInjection(input: string) {
  const sqlPattern = /('|"|;|OR\s+1=1|DROP\s+TABLE|UNION\s+SELECT)/gi;
  return sqlPattern.test(input);
}

// Nettoyage des entrées
export function sanitizeInput(input: string) {
  return input.replace(/<[^>]*>?/gm, '');
}