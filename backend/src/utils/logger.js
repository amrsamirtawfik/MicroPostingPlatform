/**
 * Logger Utility
 * 
 * Simple logging utility for consistent log formatting.
 * In production, replace with Winston or Pino for structured logging.
 */

const config = require('../config/env');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const timestamp = () => new Date().toISOString();

const logger = {
  info: (message, meta = {}) => {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${timestamp()} - ${message}`,
      Object.keys(meta).length > 0 ? meta : ''
    );
  },
  
  success: (message, meta = {}) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${timestamp()} - ${message}`,
      Object.keys(meta).length > 0 ? meta : ''
    );
  },
  
  warn: (message, meta = {}) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${timestamp()} - ${message}`,
      Object.keys(meta).length > 0 ? meta : ''
    );
  },
  
  error: (message, error = null) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${timestamp()} - ${message}`
    );
    if (error && config.nodeEnv === 'development') {
      console.error(error);
    }
  },
  
  debug: (message, meta = {}) => {
    if (config.nodeEnv === 'development') {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${timestamp()} - ${message}`,
        Object.keys(meta).length > 0 ? meta : ''
      );
    }
  },
  
  http: (method, path, statusCode, duration) => {
    const color = statusCode >= 500 ? colors.red : statusCode >= 400 ? colors.yellow : colors.green;
    console.log(
      `${colors.blue}[HTTP]${colors.reset} ${timestamp()} - ${method} ${path} ${color}${statusCode}${colors.reset} - ${duration}ms`
    );
  },
};

module.exports = logger;