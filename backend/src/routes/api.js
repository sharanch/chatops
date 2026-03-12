const router = require('express').Router();
const { httpGetMessages } = require('../controllers/messageController');

// GET /api/health — liveness probe
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/ready — readiness probe (checks DB + Redis)
router.get('/ready', async (_req, res) => {
  try {
    const db = require('../config/db');
    await db.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

// GET /api/rooms — list available rooms
router.get('/rooms', (_req, res) => {
  res.json({
    rooms: [
      { id: 'general', name: 'general', description: 'General discussion' },
      { id: 'devops',  name: 'devops',  description: 'DevOps & infra talk' },
      { id: 'random',  name: 'random',  description: 'Off-topic stuff' },
    ],
  });
});

// GET /api/rooms/:roomId/messages — message history
router.get('/rooms/:roomId/messages', httpGetMessages);

module.exports = router;
