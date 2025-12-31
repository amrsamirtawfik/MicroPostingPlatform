/**
 * Input Validation Utilities
 * 
 * Provides validation and sanitization functions for user input.
 * These are SERVER-SIDE validations - never trust client validation.
 */

const { ValidationError } = require('./errors');

// Constants
const MAX_POST_LENGTH = 280;
const MIN_PASSWORD_LENGTH = 8;
const MIN_DISPLAY_NAME_LENGTH = 2;

// Email validation (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UUID v4 validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email);
};

/**
 * Validate non-empty string
 */
const isNonEmptyString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

/**
 * Validate UUID format
 */
const isValidId = (id) => {
  if (typeof id !== 'string') return false;
  return UUID_REGEX.test(id);
};

/**
 * Sanitize text content
 * Removes dangerous characters and normalizes whitespace
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove angle brackets (basic XSS prevention)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Clamp a number between min and max
 */
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Validate pagination parameters
 */
const validatePagination = (limit, offset, order) => {
  const errors = [];
  
  // Validate limit
  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.push('Limit must be an integer between 1 and 100');
    }
  }
  
  // Validate offset
  if (offset !== undefined) {
    if (!Number.isInteger(offset) || offset < 0) {
      errors.push('Offset must be a non-negative integer');
    }
  }
  
  // Validate order
  if (order !== undefined) {
    if (!['ASC', 'DESC'].includes(order.toUpperCase())) {
      errors.push('Order must be ASC or DESC');
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
  
  return {
    limit: limit ? clamp(limit, 1, 100) : 20,
    offset: offset || 0,
    order: order ? order.toUpperCase() : 'DESC',
  };
};

/**
 * Validate registration input
 */
const validateRegistration = (email, password, displayName) => {
  const errors = [];
  
  if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }
  
  if (!isNonEmptyString(password) || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  
  if (!isNonEmptyString(displayName) || displayName.length < MIN_DISPLAY_NAME_LENGTH) {
    errors.push(`Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters`);
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
};

/**
 * Validate login input
 */
const validateLogin = (email, password) => {
  if (!isValidEmail(email) || !isNonEmptyString(password)) {
    throw new ValidationError('Invalid email or password');
  }
};

/**
 * Validate post content
 */
const validatePostContent = (content) => {
  if (!isNonEmptyString(content)) {
    throw new ValidationError('Post content cannot be empty');
  }
  
  if (content.length > MAX_POST_LENGTH) {
    throw new ValidationError(`Post content must be less than ${MAX_POST_LENGTH} characters`);
  }
};

module.exports = {
  // Constants
  MAX_POST_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  
  // Validators
  isValidEmail,
  isNonEmptyString,
  isValidId,
  sanitizeText,
  clamp,
  validatePagination,
  validateRegistration,
  validateLogin,
  validatePostContent,
};