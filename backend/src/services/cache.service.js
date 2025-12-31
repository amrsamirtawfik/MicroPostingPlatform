/**
 * Cache Service
 * 
 * Simple in-memory cache with TTL support.
 * In production, replace with Redis for distributed caching.
 */

const config = require('../config/env');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = config.cacheTTL * 1000; // Convert to milliseconds
  }
  
  /**
   * Get value from cache
   */
  async get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      logger.debug(`Cache miss (expired): ${key}`);
      return null;
    }
    
    logger.debug(`Cache hit: ${key}`);
    return item.value;
  }
  
  /**
   * Set value in cache with TTL
   */
  async set(key, value, customTTL = null) {
    const ttlMs = customTTL ? customTTL * 1000 : this.ttl;
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    
    logger.debug(`Cache set: ${key}`);
  }
  
  /**
   * Delete a specific key
   */
  async delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache deleted: ${key}`);
    }
  }
  
  /**
   * Delete keys matching a pattern
   */
  async deletePattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      logger.debug(`Cache deleted ${deletedCount} keys matching: ${pattern}`);
    }
  }
  
  /**
   * Clear all cache
   */
  async clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache cleared: ${size} items removed`);
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl / 1000,
    };
  }
}

// Cache key generators
const cacheKeys = {
  user: (userId) => `user:${userId}`,
  allUsers: () => 'users:all',
  userPosts: (userId, page = 0) => `posts:user:${userId}:page:${page}`,
  post: (postId) => `post:${postId}`,
  feed: (page = 0) => `posts:feed:page:${page}`,
};

// Export singleton instance
const cacheService = new CacheService();

module.exports = {
  cache: cacheService,
  cacheKeys,
};