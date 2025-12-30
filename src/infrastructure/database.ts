/**
 * Mock Database Layer
 * 
 * Simulates PostgreSQL behavior using in-memory storage.
 * In production, replace with actual database client (Prisma, Drizzle, etc.)
 * 
 * Production mapping:
 * - Replace in-memory arrays with PostgreSQL/MySQL
 * - Use proper ORM or query builder
 * - Implement real transactions
 * - Add connection pooling
 */

import { User, Post } from '@/types';
import { generateId, hashPassword } from '@/lib/crypto';

// In-memory data stores (simulates database tables)
let users: User[] = [];
let posts: Post[] = [];

// Transaction simulation
interface Transaction {
  userExists: (userId: string) => Promise<boolean>;
  insertPost: (data: Omit<Post, 'id' | 'createdAt' | 'deletedAt'>) => Promise<Post>;
  findPostByIdForUpdate: (postId: string) => Promise<Post | null>;
  softDeletePost: (postId: string) => Promise<void>;
}

// Initialize with seed data
const initializeData = async () => {
  if (users.length > 0) return;

  const now = new Date();
  
  // Create demo users
  const demoUsers: Omit<User, 'passwordHash'>[] = [
    {
      id: generateId(),
      email: 'alice@example.com',
      displayName: 'Alice Chen',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=alice`,
      status: 'ACTIVE',
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateId(),
      email: 'bob@example.com',
      displayName: 'Bob Smith',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=bob`,
      status: 'ACTIVE',
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateId(),
      email: 'charlie@example.com',
      displayName: 'Charlie Davis',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=charlie`,
      status: 'ACTIVE',
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      deletedAt: null,
    },
  ];

  // Hash passwords for demo users (all use 'password123')
  const passwordHash = await hashPassword('password123');
  
  users = demoUsers.map(u => ({ ...u, passwordHash }));

  // Create demo posts
  posts = [
    {
      id: generateId(),
      userId: users[0].id,
      content: 'Just deployed my first microservice! The architecture is clean and scalable. 🚀',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateId(),
      userId: users[1].id,
      content: 'TypeScript + React is such a powerful combination for building modern web apps.',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateId(),
      userId: users[0].id,
      content: 'Remember: Clean code is not about making code shorter, it\'s about making it clearer.',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateId(),
      userId: users[2].id,
      content: 'Just finished reading "Clean Architecture" by Robert Martin. Highly recommended for any developer!',
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      deletedAt: null,
    },
    {
      id: generateId(),
      userId: users[1].id,
      content: 'Cache invalidation and naming things - the two hardest problems in computer science. 😅',
      createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      deletedAt: null,
    },
  ];
};

// Initialize data on module load
initializeData();

// Database operations
export const DB = {
  // User operations
  findUserByEmail: async (
    email: string,
    options?: { select?: (keyof User)[] }
  ): Promise<Partial<User> | null> => {
    await initializeData();
    const user = users.find(u => u.email === email && !u.deletedAt);
    if (!user) return null;
    
    if (options?.select) {
      const selected: Partial<User> = {};
      options.select.forEach(key => {
        (selected as Record<string, unknown>)[key] = user[key];
      });
      return selected;
    }
    
    return { ...user };
  },

  findUserById: async (
    id: string,
    options?: { where?: { deletedAt: null } }
  ): Promise<User | null> => {
    await initializeData();
    const user = users.find(u => {
      if (u.id !== id) return false;
      if (options?.where?.deletedAt === null && u.deletedAt !== null) return false;
      return true;
    });
    return user ? { ...user } : null;
  },

  findAllUsers: async (): Promise<User[]> => {
    await initializeData();
    return users.filter(u => !u.deletedAt).map(u => ({ ...u }));
  },

  createUser: async (data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'failedLoginCount' | 'lockedUntil'>): Promise<User> => {
    await initializeData();
    const newUser: User = {
      ...data,
      id: generateId(),
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
      deletedAt: null,
    };
    users.push(newUser);
    return { ...newUser };
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User | null> => {
    await initializeData();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...data };
    return { ...users[index] };
  },

  // Post operations
  findPosts: async (options: {
    where?: { userId?: string; deletedAt?: null };
    orderBy?: { createdAt: 'ASC' | 'DESC' };
    limit?: number;
    offset?: number;
  }): Promise<Post[]> => {
    await initializeData();
    let result = [...posts];
    
    // Filter
    if (options.where?.userId) {
      result = result.filter(p => p.userId === options.where!.userId);
    }
    if (options.where?.deletedAt === null) {
      result = result.filter(p => p.deletedAt === null);
    }
    
    // Sort
    if (options.orderBy?.createdAt) {
      result.sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        return options.orderBy!.createdAt === 'ASC' ? diff : -diff;
      });
    }
    
    // Paginate
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;
    result = result.slice(offset, offset + limit);
    
    return result.map(p => ({ ...p }));
  },

  findOnePost: async (options: {
    where?: { userId?: string; deletedAt?: null };
    orderBy?: { createdAt: 'ASC' | 'DESC' };
  }): Promise<Post | null> => {
    const results = await DB.findPosts({ ...options, limit: 1 });
    return results[0] || null;
  },

  findPostById: async (id: string): Promise<Post | null> => {
    await initializeData();
    const post = posts.find(p => p.id === id);
    return post ? { ...post } : null;
  },

  // Transaction simulation
  transaction: async <T>(callback: (tx: Transaction) => Promise<T>): Promise<T> => {
    await initializeData();
    
    // Create a snapshot for rollback (simplified)
    const postSnapshot = [...posts];
    
    const tx: Transaction = {
      userExists: async (userId: string) => {
        return users.some(u => u.id === userId && !u.deletedAt && u.status === 'ACTIVE');
      },
      
      insertPost: async (data) => {
        const newPost: Post = {
          ...data,
          id: generateId(),
          createdAt: new Date(),
          deletedAt: null,
        };
        posts.push(newPost);
        return { ...newPost };
      },
      
      findPostByIdForUpdate: async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        return post ? { ...post } : null;
      },
      
      softDeletePost: async (postId: string) => {
        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
          posts[index] = { ...posts[index], deletedAt: new Date() };
        }
      },
    };
    
    try {
      return await callback(tx);
    } catch (error) {
      // Rollback on error
      posts = postSnapshot;
      throw error;
    }
  },
};

// Export for debugging
export const getDbStats = () => ({
  users: users.length,
  posts: posts.length,
  activePosts: posts.filter(p => !p.deletedAt).length,
});
