import app from './app';
import { prisma } from './prisma/client';

const PORT = process.env.PORT || 3000;

// Exportez l'instance du serveur pour les tests
export const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Gestion propre de la fermeture
process.on('SIGTERM', () => {
  server.close(() => {
    prisma.$disconnect().finally(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});