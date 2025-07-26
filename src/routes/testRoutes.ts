// testRoutes.ts
import express from 'express';
const router = express.Router();

// Middleware pour logger les requêtes
router.use((req, res, next) => {
  console.log(`[TEST] ${req.method} ${req.path}`, req.body);
  next();
});

// Route GET (plus simple à tester)
router.get('/test-get', (req, res) => {
  res.status(200).json({ message: 'GET test OK', body: req.body });
});

// Route POST (comme dans votre exemple)
router.post('/test-post', (req, res) => {
  res.status(200).json({ message: 'POST test OK', body: req.body });
});

export default router;