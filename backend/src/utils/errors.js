/**
 * Custom Error Classes
 * 
 * Provides typed errors for consistent error handling across the application.
 * Each error includes a code, message, and HTTP status.
 */

class AppError extends Error {
    constructor(message, code, statusCode = 500) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
      super(message, 'VALIDATION_ERROR', 400);
    }
  }
  
  class InvalidCredentialsError extends AppError {
    constructor(message = 'Invalid email or password') {
      super(message, 'INVALID_CREDENTIALS', 401);
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
      super(message, 'UNAUTHORIZED', 401);
    }
  }
  
  class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
      super(message, 'FORBIDDEN', 403);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
      super(`${resource} not found`, 'NOT_FOUND', 404);
    }
  }
  
  class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
      super(message, 'CONFLICT', 409);
    }
  }
  
  class AccountLockedError extends AppError {
    constructor(message = 'Account temporarily locked due to multiple failed login attempts') {
      super(message, 'ACCOUNT_LOCKED', 423);
    }
  }
  
  class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
      super(message, 'RATE_LIMIT_EXCEEDED', 429);
    }
  }
  
  module.exports = {
    AppError,
    ValidationError,
    InvalidCredentialsError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    AccountLockedError,
    RateLimitError,
  };