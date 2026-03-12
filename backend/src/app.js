const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const { requestLogger } = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

function createApp() {
  const app = express();

  // ── Security ─────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({
    origin:      process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  // ── Body parsing ─────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false }));

  // ── Request logging ──────────────────────────────────────
  app.use(requestLogger);

  // Trust proxy (needed behind ingress/nginx in K8s)
  app.set('trust proxy', 1);

  // ── Routes ───────────────────────────────────────────────
  app.use('/api', apiRoutes);

  // ── Error handling ───────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
