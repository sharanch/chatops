const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host:     process.env.POSTGRES_HOST     || 'localhost',
  port:     parseInt(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB       || 'chatops',
  user:     process.env.POSTGRES_USER     || 'chatops',
  password: process.env.POSTGRES_PASSWORD || 'chatops_secret',
  max: 20,                  // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

/**
 * Run a parameterised query.
 * Usage: db.query('SELECT * FROM messages WHERE room_id = $1', [roomId])
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('DB query', { text, duration, rows: res.rowCount });
  return res;
}

/**
 * Grab a client from the pool for transactions.
 */
async function getClient() {
  return pool.connect();
}

/**
 * Run migrations on startup — creates tables if they don't exist.
 */
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id     VARCHAR(64)  NOT NULL,
      user_id     VARCHAR(64)  NOT NULL,
      username    VARCHAR(64)  NOT NULL,
      content     TEXT         NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_room_id
      ON messages (room_id, created_at DESC);
  `);
  logger.info('DB migrations applied');
}

module.exports = { query, getClient, migrate, pool };
