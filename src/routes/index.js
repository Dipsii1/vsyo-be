import express from 'express';
const router = express.Router();

// Greeting API
router.get('/', function (req, res) {
  res.send('Hello \n Selamat datang di API');
});

export default router;