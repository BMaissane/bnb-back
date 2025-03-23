import app from './app'; 
import http from 'http';

const port = process.env.PORT || 3000;

// Créez un serveur HTTP
const server = http.createServer(app);

// Démarrez le serveur
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});