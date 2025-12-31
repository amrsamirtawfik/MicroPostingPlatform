/**
 * Post Model (Business Logic Layer)
 * 
 * Contains all post-related business logic, validation, and authorization.
 * This is the "Model" in MVC - handles data and business rules.
 * 
 * CRITICAL: This runs ONLY on the backend server.
 */

const { DB } = require('../services/database.service');
const { cache, cacheKeys } = require('../services/cache.service');
const UserModel = require('./User.model');
const { 
  ValidationError, 
  NotFoundError,
  ForbiddenError,
} = require('../utils/errors');
const { 
  isValidId, 
  sanitizeText,
  validatePagination,
  validatePostContent,
} = require('../utils/validators');
const logger = require('../utils/logger');

const PostModel = {
  /**
   * Get all posts by a specific user with pagination
   */
  getByUserId: async (userId, options = {}) => {
    if (!isValidId(userId)) {
      throw new ValidationError('Invalid userId');
    }
    
    // Validate and normalize pagination
    const { limit, offset, order } = validatePagination(
      options.limit, 
      options.offset, 
      options.order
    );
    
    // Check cache
    const page = Math.floor(offset / limit);
    const cacheKey = cacheKeys.userPosts(userId, page);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const posts = await DB.findPosts({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: order },
      limit,
      offset,
    });
    
    await cache.set(cacheKey, posts);
    
    return posts;
  },
  
  /**
   * Get all posts with author information (feed)
   */
  getAllWithAuthors: async (options = {}) => {
    const { limit, offset, order } = validatePagination(
      options.limit, 
      options.offset, 
      options.order
    );
    
    // Check cache
    const page = Math.floor(offset / limit);
    const cacheKey = cacheKeys.feed(page);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const posts = await DB.findPosts({
      where: { deletedAt: null },
      orderBy: { createdAt: order },
      limit,
      offset,
    });
    
    // Enrich with author data
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        try {
          const author = await UserModel.getById(post.userId);
          return { ...post, author };
        } catch (error) {
          // If author not found, skip this post
          logger.warn(`Post ${post.id} has invalid author ${post.userId}`);
          return null;
        }
      })
    );
    
    // Filter out posts with missing authors
    const validPosts = postsWithAuthors.filter(p => p !== null);
    
    await cache.set(cacheKey, validPosts);
    
    return validPosts;
  },
  
  /**
   * Get a single post by ID
   */
  getById: async (postId) => {
    if (!isValidId(postId)) {
      throw new ValidationError('Invalid post ID');
    }
    
    const cacheKey = cacheKeys.post(postId);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const post = await DB.findPostById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundError('Post');
    }
    
    const author = await UserModel.getById(post.userId);
    const postWithAuthor = { ...post, author };
    
    await cache.set(cacheKey, postWithAuthor);
    
    return postWithAuthor;
  },
  
  /**
   * Create a new post
   * 
   * Authorization: User must be authenticated (checked by middleware)
   * Validation: Content length, sanitization
   */
  create: async (userId, content) => {
    if (!isValidId(userId)) {
      throw new ValidationError('Invalid userId');
    }
    
    // Validate content
    validatePostContent(content);
    
    // Sanitize content (XSS prevention)
    const sanitizedContent = sanitizeText(content);
    
    const post = await DB.transaction(async (tx) => {
      // Ensure user exists and is active
      const userExists = await tx.userExists(userId);
      if (!userExists) {
        throw new NotFoundError('User');
      }
      
      const newPost = await tx.insertPost({
        userId,
        content: sanitizedContent,
      });
      
      return newPost;
    });
    
    // Invalidate caches
    await cache.deletePattern(`posts:user:${userId}:*`);
    await cache.deletePattern('posts:feed:*');
    
    logger.success(`Post created by user ${userId}: ${post.id}`);
    
    return post;
  },
  
  /**
   * Delete a post (soft delete)
   * 
   * Authorization: Only the owner can delete their posts
   * This is enforced here, not in the controller
   */
  deleteOwned: async (postId, userId) => {
    if (!isValidId(postId) || !isValidId(userId)) {
      throw new ValidationError('Invalid post or user ID');
    }
    
    const result = await DB.transaction(async (tx) => {
      const post = await tx.findPostByIdForUpdate(postId);
      
      if (!post || post.deletedAt) {
        throw new NotFoundError('Post');
      }
      
      // Authorization check: Only owner can delete
      if (post.userId !== userId) {
        throw new ForbiddenError('You can only delete your own posts');
      }
      
      await tx.softDeletePost(postId);
      return true;
    });
    
    // Invalidate caches
    await cache.delete(cacheKeys.post(postId));
    await cache.deletePattern(`posts:user:${userId}:*`);
    await cache.deletePattern('posts:feed:*');
    
    logger.success(`Post deleted: ${postId} by user ${userId}`);
    
    return result;
  },
};

module.exports = PostModel;