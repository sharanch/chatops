require('dotenv').config();

const http    = require('http');
const { createApp }    = require('./app');
const { setupSocket }  = require('./config/socket');
const { connectRedis } = require('./config/redis');
const { migrate, pool } = require('./config/db');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT) || 4000;

async function start() {
  try {
    // 1. Run DB migrations
    await migrate();

    // 2. Connect Redis clients
    await connectRedis();

    // 3. Build Express app + HTTP server
    const app    = createApp();
    const server = http.createServer(app);

    // 4. Attach Socket.io
    setupSocket(server);

    // 5. Listen
    server.listen(PORT, () => {
      logger.info(`ChatOps backend running`, {
        port: PORT,
        env:  process.env.NODE_ENV || 'development',
      });
    });

    // ── Graceful shutdown ─────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);

      server.close(async () => {
        try {
          await pool.end();
          logger.info('PostgreSQL pool closed');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { error: err.message });
          process.exit(1);
        }
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
