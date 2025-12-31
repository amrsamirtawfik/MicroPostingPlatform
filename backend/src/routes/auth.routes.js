/**
 * Auth Routes
 * 
 * Defines authentication endpoints.
 * Routes requests to appropriate controller methods.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/register
 * Register a new user account
 * Public route
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticate user and get JWT token
 * Public route
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Protected route - requires JWT token
 */
router.get('/me', requireAuth, authController.me);

/**
 * POST /api/auth/logout
 * Logout current user
 * Protected route - requires JWT token
 */
router.post('/logout', requireAuth, authController.logout);

module.exports = router;