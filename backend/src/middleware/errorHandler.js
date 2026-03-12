const logger = require('../utils/logger');

// 404 handler
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

// Global error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  logger.error('Unhandled error', {
    method: req.method,
    path:   req.path,
    status,
    error:  err.message,
  });
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = { notFound, errorHandler };
