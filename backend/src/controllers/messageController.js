const db = require('../config/db');
const logger = require('../utils/logger');

const VALID_ROOMS = ['general', 'devops', 'random'];
const MESSAGE_LIMIT = 50;

/**
 * Persist a new message to PostgreSQL.
 */
async function saveMessage({ roomId, userId, username, content }) {
  const { rows } = await db.query(
    `INSERT INTO messages (room_id, user_id, username, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, room_id AS "roomId", user_id AS "userId",
               username, content, created_at AS "createdAt"`,
    [roomId, userId, username, content]
  );
  return rows[0];
}

/**
 * Fetch the last N messages for a room.
 */
async function getMessages(roomId, limit = MESSAGE_LIMIT) {
  if (!VALID_ROOMS.includes(roomId)) {
    throw new Error(`Invalid room: ${roomId}`);
  }

  const { rows } = await db.query(
    `SELECT id,
            room_id     AS "roomId",
            user_id     AS "userId",
            username,
            content,
            created_at  AS "createdAt"
     FROM messages
     WHERE room_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [roomId, limit]
  );

  return rows;
}

/**
 * HTTP handler: GET /api/rooms/:roomId/messages
 */
async function httpGetMessages(req, res) {
  const { roomId } = req.params;

  if (!VALID_ROOMS.includes(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  try {
    const messages = await getMessages(roomId);
    res.json({ roomId, messages });
  } catch (err) {
    logger.error('httpGetMessages error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

module.exports = { saveMessage, getMessages, httpGetMessages, VALID_ROOMS };
