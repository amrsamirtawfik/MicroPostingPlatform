/**
 * Auth Controller
 * 
 * Handles authentication-related HTTP requests.
 * This is the "Controller" in MVC - connects routes to business logic.
 * 
 * Responsibilities:
 * - Parse request body/params
 * - Call appropriate model methods
 * - Format and send HTTP responses
 */

const UserModel = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user account
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;
  
  // Call business logic
  const result = await UserModel.register(email, password, displayName);
  
  logger.info(`New user registered: ${email}`);
  
  // Send response
  res.status(201).json(result);
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Call business logic
  const result = await UserModel.authenticate(email, password);
  
  logger.info(`User logged in: ${email}`);
  
  // Send response
  res.status(200).json(result);
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
const me = asyncHandler(async (req, res) => {
  // req.user is attached by requireAuth middleware
  const userId = req.user.id;
  
  // Get full user data
  const user = await UserModel.getById(userId);
  
  // Convert to safe user (include email since it's the authenticated user)
  const safeUser = {
    id: user.id,
    email: req.user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
  
  res.status(200).json(safeUser);
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, no server action needed)
 */
const logout = asyncHandler(async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // Server doesn't need to do anything unless implementing token blacklist
  
  logger.info(`User logged out: ${req.user?.email || 'unknown'}`);
  
  res.status(200).json({
    message: 'Logged out successfully',
  });
});

module.exports = {
  register,
  login,
  me,
  logout,
};