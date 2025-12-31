/**
 * Cryptography Service
 * 
 * Handles password hashing and JWT token operations.
 * CRITICAL: This must ONLY run on the backend for security.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const config = require('../config/env');

/**
 * Generate a unique ID (UUID v4)
 */
const generateId = () => {
  return randomUUID();
};

/**
 * Hash a password using bcrypt
 * Uses configurable rounds (default: 12)
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.bcryptRounds);
};

/**
 * Verify a password against a hash
 * Uses constant-time comparison to prevent timing attacks
 */
const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
};

/**
 * Generate a dummy password hash for timing attack prevention
 * When a user doesn't exist, we still hash to maintain constant time
 */
const DUMMY_PASSWORD_HASH = '$2b$12$dummyhashfortimingatttackpreventionxxxxxxxxxxxxxxxxxxxxxx';

/**
 * Generate a JWT token
 */
const generateToken = (userId, email) => {
  const payload = {
    userId,
    email,
  };
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: 'micropost-api',
    subject: userId,
  });
};

/**
 * Verify and decode a JWT token
 * Returns payload if valid, null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: 'micropost-api',
    });
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification (for debugging only)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateId,
  hashPassword,
  verifyPassword,
  DUMMY_PASSWORD_HASH,
  generateToken,
  verifyToken,
  decodeToken,
};