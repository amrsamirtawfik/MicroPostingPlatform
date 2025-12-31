/**
 * Post Controller
 * 
 * Handles post-related HTTP requests.
 * Provides CRUD operations for posts.
 */

const PostModel = require('../models/Post.model');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * GET /api/posts
 * Get all posts with pagination (feed)
 */
const getAllPosts = asyncHandler(async (req, res) => {
  // Parse query parameters
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
  const order = req.query.order;
  
  const posts = await PostModel.getAllWithAuthors({ limit, offset, order });
  
  res.status(200).json(posts);
});

/**
 * GET /api/posts/:postId
 * Get a specific post by ID
 */
const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  
  const post = await PostModel.getById(postId);
  
  res.status(200).json(post);
});

/**
 * POST /api/posts
 * Create a new post (requires authentication)
 */
const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id; // From requireAuth middleware
  
  const post = await PostModel.create(userId, content);
  
  res.status(201).json(post);
});

/**
 * DELETE /api/posts/:postId
 * Delete a post (requires authentication and ownership)
 */
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // From requireAuth middleware
  
  await PostModel.deleteOwned(postId, userId);
  
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

/**
 * GET /api/users/:userId/posts
 * Get all posts by a specific user
 */
const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
  const order = req.query.order;
  
  const posts = await PostModel.getByUserId(userId, { limit, offset, order });
  
  res.status(200).json(posts);
});

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  getUserPosts,
};