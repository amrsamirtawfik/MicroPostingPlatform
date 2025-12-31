/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user info to request.
 * This is critical for protecting routes and enforcing authorization.
 */

const { verifyToken } = require('../services/crypto.service');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Require authentication middleware
 * Verifies JWT token and attaches user to request
 * 
 * Usage: Add to routes that require authentication
 * Example: router.get('/protected', requireAuth, controller.handler)
 */
const requireAuth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const payload = verifyToken(token);
    
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }
    
    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
    };
    
    logger.debug(`Authenticated request from user: ${req.user.email}`);
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        error: error.message,
        code: error.code,
      });
    }
    
    // Catch any other token verification errors
    logger.warn('Token verification failed', error);
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 * 
 * Usage: Add to routes that work for both authenticated and guest users
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (payload) {
        req.user = {
          id: payload.userId,
          email: payload.email,
        };
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};