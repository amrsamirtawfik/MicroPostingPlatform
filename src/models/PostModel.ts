/**
 * Post Model
 * 
 * Contains all post-related business logic.
 * Authorization and validation happen at this layer.
 */

import { Post, PostWithAuthor, PaginationOptions } from '@/types';
import { DB } from '@/infrastructure/database';
import { cache, cacheKeys } from '@/infrastructure/cache';
import { 
  InvalidInputError, 
  NotFoundError,
  ForbiddenError,
  ValidationError 
} from '@/lib/errors';
import { 
  isValidId, 
  isNonEmptyString,
  sanitizeText,
  clamp,
  MAX_POST_LENGTH 
} from '@/lib/validators';
import { UserModel } from './UserModel';

export const PostModel = {
  /**
   * Get all posts by a specific user with pagination
   */
  getByUserId: async (userId: string, options: PaginationOptions = {}): Promise<Post[]> => {
    if (!isValidId(userId)) {
      throw new InvalidInputError('Invalid userId');
    }

    // Defensive options validation
    if (options !== null && typeof options !== 'object') {
      throw new InvalidInputError('Options must be an object');
    }

    let { limit = 20, offset = 0, order = 'DESC' } = options;

    // Validate & normalize limit
    if (!Number.isInteger(limit)) {
      throw new InvalidInputError('Limit must be an integer');
    }
    const safeLimit = clamp(limit, 1, 100);

    // Validate & normalize offset
    if (!Number.isInteger(offset) || offset < 0) {
      throw new InvalidInputError('Offset must be a non-negative integer');
    }

    // Validate & normalize order
    if (typeof order !== 'string') {
      throw new InvalidInputError('Order must be a string');
    }
    const normalizedOrder = order.toUpperCase() as 'ASC' | 'DESC';
    if (!['ASC', 'DESC'].includes(normalizedOrder)) {
      throw new InvalidInputError('Order must be ASC or DESC');
    }

    // Check cache
    const page = Math.floor(offset / safeLimit);
    const cacheKey = cacheKeys.userPosts(userId, page);
    const cached = await cache.get<Post[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const posts = await DB.findPosts({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: normalizedOrder },
      limit: safeLimit,
      offset,
    });

    await cache.set(cacheKey, posts);
    
    return posts;
  },

  /**
   * Get all posts with author information
   */
  getAllWithAuthors: async (options: PaginationOptions = {}): Promise<PostWithAuthor[]> => {
    const { limit = 20, offset = 0, order = 'DESC' } = options;
    
    const posts = await DB.findPosts({
      where: { deletedAt: null },
      orderBy: { createdAt: order },
      limit: clamp(limit, 1, 100),
      offset: Math.max(0, offset),
    });

    // Enrich with author data
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await UserModel.getById(post.userId);
        return { ...post, author };
      })
    );

    return postsWithAuthors;
  },

  /**
   * Get the first (oldest) post by a user
   */
  getFirstByUser: async (userId: string): Promise<Post | null> => {
    if (!isValidId(userId)) {
      throw new InvalidInputError('Invalid userId');
    }

    const post = await DB.findOnePost({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'ASC' },
    });

    return post ?? null;
  },

  /**
   * Create a new post
   */
  create: async (userId: string, content: string): Promise<Post> => {
    if (!isValidId(userId)) {
      throw new InvalidInputError('Invalid userId');
    }

    if (!isNonEmptyString(content) || content.length > MAX_POST_LENGTH) {
      throw new ValidationError(`Post content must be between 1 and ${MAX_POST_LENGTH} characters`);
    }

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

    // Invalidate user posts cache
    await cache.deletePattern(`posts:user:${userId}:*`);

    return post;
  },

  /**
   * Delete a post (soft delete)
   * Only the owner can delete their posts
   */
  deleteOwned: async (postId: string, userId: string): Promise<boolean> => {
    if (!isValidId(postId) || !isValidId(userId)) {
      throw new InvalidInputError('Invalid post or user ID');
    }

    const result = await DB.transaction(async (tx) => {
      const post = await tx.findPostByIdForUpdate(postId);

      if (!post || post.deletedAt) {
        throw new NotFoundError('Post');
      }

      if (post.userId !== userId) {
        throw new ForbiddenError('You can only delete your own posts');
      }

      await tx.softDeletePost(postId);
      return true;
    });

    // Invalidate caches
    await cache.delete(cacheKeys.post(postId));
    await cache.deletePattern(`posts:user:${userId}:*`);

    return result;
  },

  /**
   * Get a single post by ID
   */
  getById: async (postId: string): Promise<PostWithAuthor> => {
    if (!isValidId(postId)) {
      throw new InvalidInputError('Invalid post ID');
    }

    const cacheKey = cacheKeys.post(postId);
    const cached = await cache.get<PostWithAuthor>(cacheKey);
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
};
