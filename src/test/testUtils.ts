import { Server } from 'http';
import app from '../app';

let server: Server;

export const startTestServer = (port = 0) => {
  if (!server) {
    server = app.listen(port);
  }
  return server;
};

export const stopTestServer = async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
};