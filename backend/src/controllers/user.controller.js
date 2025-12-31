/**
 * User Controller
 * 
 * Handles user-related HTTP requests.
 * Provides public user information (profiles, lists).
 */

const UserModel = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * GET /api/users
 * Get all users (public profiles)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.getAll();
  
  res.status(200).json(users);
});

/**
 * GET /api/users/:userId
 * Get a specific user by ID (public profile)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await UserModel.getById(userId);
  
  res.status(200).json(user);
});

module.exports = {
  getAllUsers,
  getUserById,
};