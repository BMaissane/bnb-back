module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Point d'entrée pour trouver les tests
  testMatch: [
    '**/tests/**/*.test.ts', // Cherche dans src/tests
    '**/?(*.)+(spec|test).ts' // Alternative
  ],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};