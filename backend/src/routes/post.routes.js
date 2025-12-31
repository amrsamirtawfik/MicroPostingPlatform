/**
 * Post Routes
 * 
 * Defines post-related endpoints.
 * Routes requests to appropriate controller methods.
 */

const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/posts
 * Get all posts (feed)
 * Optional authentication - works for both guests and logged-in users
 */
router.get('/', optionalAuth, postController.getAllPosts);

/**
 * GET /api/posts/:postId
 * Get a specific post
 * Public route
 */
router.get('/:postId', postController.getPostById);

/**
 * POST /api/posts
 * Create a new post
 * Protected route - requires JWT token
 */
router.post('/', requireAuth, postController.createPost);

/**
 * DELETE /api/posts/:postId
 * Delete a post
 * Protected route - requires JWT token
 * Authorization check happens in the model layer
 */
router.delete('/:postId', requireAuth, postController.deletePost);

module.exports = router;