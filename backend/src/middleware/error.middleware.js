/**
 * Error Handling Middleware
 * 
 * Centralized error handling for consistent API responses.
 * Catches all errors and formats them properly for the client.
 */

const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Global error handler
 * Must be registered AFTER all routes
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error in ${req.method} ${req.path}`, err);
  
  // Handle known operational errors (AppError instances)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  
  // Handle unknown/programming errors
  const statusCode = err.statusCode || 500;
  const message = config.nodeEnv === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 * Must be registered AFTER all routes but BEFORE error handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch promise rejections
 * 
 * Usage:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};