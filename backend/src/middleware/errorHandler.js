/**
 * Global error handler middleware.
 * Sends appropriate HTTP status and JSON body; never leaks stack in production.
 */
const config = require('../config');

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const body = { error: message };
  if (config.env !== 'production' && err.stack) {
    body.stack = err.stack;
  }
  res.status(status).json(body);
}

module.exports = { errorHandler };
