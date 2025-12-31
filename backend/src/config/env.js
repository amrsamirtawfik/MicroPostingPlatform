/**
 * Environment Configuration
 * 
 * Centralizes all environment variables with defaults and validation.
 * All sensitive configuration should be loaded from .env file.
 */

require('dotenv').config();

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  maxFailedLoginAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS, 10) || 5,
  accountLockoutDurationMs: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION_MS, 10) || 15 * 60 * 1000,
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  
  // Cache
  cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300,
};

// Validate critical config
if (config.nodeEnv === 'production') {
  if (config.jwtSecret === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
}

module.exports = config;