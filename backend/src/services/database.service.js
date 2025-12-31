/**
 * Database Service
 * 
 * Mock in-memory database for development.
 * In production, replace with:
 * - PostgreSQL with Prisma/Drizzle
 * - MongoDB with Mongoose
 * - MySQL with Sequelize
 * 
 * This simulates database operations with proper transaction support.
 */

const { generateId, hashPassword } = require('./crypto.service');
const logger = require('../utils/logger');

// In-memory data stores (simulates database tables)
let users = [];
let posts = [];

/**
 * Initialize with seed data
 */
const initializeData = async () => {
  if (users.length > 0) return;
  
  logger.info('Initializing database with seed data...');
  
  const now = new Date();
  const passwordHash = await hashPassword('password123');
  
  // Create demo users
  users = [
    {
      id: generateId(),
      email: 'alice@example.com',
      displayName: 'Alice Chen',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      passwordHash,
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
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      passwordHash,
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
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      passwordHash,
      status: 'ACTIVE',
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      deletedAt: null,
    },
  ];
  
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
      content: 'Just finished reading "Clean Architecture" by Robert Martin. Highly recommended!',
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
  
  logger.success(`Database initialized with ${users.length} users and ${posts.length} posts`);
};

// Database operations
const DB = {
  // User operations
  findUserByEmail: async (email, options = {}) => {
    await initializeData();
    const user = users.find(u => u.email === email && !u.deletedAt);
    if (!user) return null;
    
    if (options.select) {
      const selected = {};
      options.select.forEach(key => {
        selected[key] = user[key];
      });
      return selected;
    }
    
    return { ...user };
  },
  
  findUserById: async (id, options = {}) => {
    await initializeData();
    const user = users.find(u => {
      if (u.id !== id) return false;
      if (options.where?.deletedAt === null && u.deletedAt !== null) return false;
      return true;
    });
    return user ? { ...user } : null;
  },
  
  findAllUsers: async () => {
    await initializeData();
    return users.filter(u => !u.deletedAt).map(u => ({ ...u }));
  },
  
  createUser: async (data) => {
    await initializeData();
    const newUser = {
      ...data,
      id: generateId(),
      failedLoginCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
      deletedAt: null,
    };
    users.push(newUser);
    logger.info(`User created: ${newUser.email}`);
    return { ...newUser };
  },
  
  updateUser: async (id, data) => {
    await initializeData();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...data };
    logger.debug(`User updated: ${id}`);
    return { ...users[index] };
  },
  
  // Post operations
  findPosts: async (options = {}) => {
    await initializeData();
    let result = [...posts];
    
    // Filter
    if (options.where?.userId) {
      result = result.filter(p => p.userId === options.where.userId);
    }
    if (options.where?.deletedAt === null) {
      result = result.filter(p => p.deletedAt === null);
    }
    
    // Sort
    if (options.orderBy?.createdAt) {
      result.sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        return options.orderBy.createdAt === 'ASC' ? diff : -diff;
      });
    }
    
    // Paginate
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;
    result = result.slice(offset, offset + limit);
    
    return result.map(p => ({ ...p }));
  },
  
  findOnePost: async (options = {}) => {
    const results = await DB.findPosts({ ...options, limit: 1 });
    return results[0] || null;
  },
  
  findPostById: async (id) => {
    await initializeData();
    const post = posts.find(p => p.id === id);
    return post ? { ...post } : null;
  },
  
  createPost: async (data) => {
    await initializeData();
    const newPost = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      deletedAt: null,
    };
    posts.push(newPost);
    logger.info(`Post created: ${newPost.id}`);
    return { ...newPost };
  },
  
  softDeletePost: async (id) => {
    await initializeData();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], deletedAt: new Date() };
      logger.info(`Post deleted: ${id}`);
    }
  },
  
  // Transaction simulation
  transaction: async (callback) => {
    await initializeData();
    
    // Create snapshots for rollback
    const postSnapshot = JSON.parse(JSON.stringify(posts));
    const userSnapshot = JSON.parse(JSON.stringify(users));
    
    const tx = {
      userExists: async (userId) => {
        return users.some(u => u.id === userId && !u.deletedAt && u.status === 'ACTIVE');
      },
      
      insertPost: async (data) => {
        return await DB.createPost(data);
      },
      
      findPostByIdForUpdate: async (postId) => {
        return await DB.findPostById(postId);
      },
      
      softDeletePost: async (postId) => {
        return await DB.softDeletePost(postId);
      },
    };
    
    try {
      return await callback(tx);
    } catch (error) {
      // Rollback on error
      posts = postSnapshot;
      users = userSnapshot;
      logger.error('Transaction rolled back', error);
      throw error;
    }
  },
};

// Export statistics for debugging
const getDbStats = () => ({
  users: users.length,
  posts: posts.length,
  activePosts: posts.filter(p => !p.deletedAt).length,
});

module.exports = {
  DB,
  getDbStats,
};