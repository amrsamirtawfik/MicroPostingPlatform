/**
 * Mock Cache Layer
 * 
 * Simulates Redis cache behavior using in-memory Map.
 * In production, replace with actual Redis client.
 * 
 * Production mapping:
 * - Replace MockCache with Redis/Memcached client
 * - Add TTL support via Redis SETEX
 * - Add distributed cache invalidation
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MockCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      console.log(`[CACHE] Miss: ${key}`);
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      console.log(`[CACHE] Expired: ${key}`);
      return null;
    }
    
    console.log(`[CACHE] Hit: ${key}`);
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTL);
    this.store.set(key, { value, expiresAt });
    console.log(`[CACHE] Set: ${key}`);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    console.log(`[CACHE] Delete: ${key}`);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete: string[] = [];
    
    this.store.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.store.delete(key));
    console.log(`[CACHE] Delete pattern ${pattern}: ${keysToDelete.length} keys`);
  }

  // For debugging
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

export const cache = new MockCache();

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userPosts: (userId: string, page: number) => `posts:user:${userId}:page:${page}`,
  allUsers: () => 'users:all',
  post: (id: string) => `post:${id}`,
};
