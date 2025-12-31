/**
 * User Routes
 * 
 * Defines user-related endpoints.
 * Routes requests to appropriate controller methods.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const postController = require('../controllers/post.controller');

/**
 * GET /api/users
 * Get all users (public profiles)
 * Public route
 */
router.get('/', userController.getAllUsers);

/**
 * GET /api/users/:userId
 * Get a specific user's public profile
 * Public route
 */
router.get('/:userId', userController.getUserById);

/**
 * GET /api/users/:userId/posts
 * Get all posts by a specific user
 * Public route
 */
router.get('/:userId/posts', postController.getUserPosts);

module.exports = router;