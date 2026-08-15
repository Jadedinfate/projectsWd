/**
 * Global error handler — last middleware in the chain.
 * Formats all errors into a consistent JSON shape.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code       = err.code || 'INTERNAL_ERROR';

  // Always log full error server-side
  console.error(`[${code}] ${err.message}`, err.stack || '');

  res.status(statusCode).json({
    error: {
      code,
      message: err.message,
      details: err.details || {},
    },
  });
}

module.exports = errorHandler;
