import express from 'express';

const app = express();
const port = 3000;

// Middlewares
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Exportez l'application pour une utilisation dans server.tsx
export default app;