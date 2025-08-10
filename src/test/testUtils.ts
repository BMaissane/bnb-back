import { Server } from 'http';
import app from '../app';

const TEST_PORT = 0; // 0 = port aléatoire automatique
let currentServer: Server | null = null;

export const startTestServer = async (): Promise<number> => {
  await stopTestServer(); // Nettoyage préalable

  return new Promise((resolve, reject) => {
    currentServer = app.listen(TEST_PORT, () => {
      const port = (currentServer?.address() as any)?.port;
      console.log(`Test server started on random port ${port}`);
      resolve(port);
    });
    
    currentServer.on('error', (err) => {
      console.error('Server error:', err);
      reject(err);
    });
  });
};

export const stopTestServer = async (): Promise<void> => {
  if (!currentServer) return;
  
  await new Promise<void>((resolve) => {
    currentServer?.close(() => {
      console.log('Test server stopped');
      resolve();
    });
    
    // Force close after 3s if needed
    setTimeout(() => {
      currentServer?.closeAllConnections();
      resolve();
    }, 3000);
    
    currentServer = null;
  });
};