/**
 * User Model (Business Logic Layer)
 * 
 * Contains all user-related business logic, validation, and authorization.
 * This is the "Model" in MVC - handles data and business rules.
 * 
 * CRITICAL: This runs ONLY on the backend server.
 */

const { DB } = require('../services/database.service');
const { cache, cacheKeys } = require('../services/cache.service');
const { 
  verifyPassword, 
  hashPassword, 
  DUMMY_PASSWORD_HASH,
  generateToken 
} = require('../services/crypto.service');
const { 
  InvalidCredentialsError, 
  ValidationError, 
  NotFoundError,
  AccountLockedError,
  ConflictError,
} = require('../utils/errors');
const { 
  isValidEmail, 
  isNonEmptyString, 
  isValidId,
  validateRegistration,
  validateLogin,
} = require('../utils/validators');
const config = require('../config/env');
const logger = require('../utils/logger');

const UserModel = {
  /**
   * Authenticate user with email and password
   * 
   * Security features:
   * - Constant-time comparison (timing attack prevention)
   * - Account lockout after failed attempts
   * - No user enumeration (same error for any failure)
   * - Secure password hashing verification
   */
  authenticate: async (email, password) => {
    // Input validation
    validateLogin(email, password);
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Fetch user with required fields
    const user = await DB.findUserByEmail(normalizedEmail, {
      select: ['id', 'email', 'displayName', 'avatarUrl', 'passwordHash', 'status', 'failedLoginCount', 'lockedUntil']
    });
    
    // Use dummy hash if user doesn't exist (prevents timing attacks)
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isValidPassword = await verifyPassword(password, passwordHash);
    
    // Check account lock
    if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      logger.warn(`Login attempt on locked account: ${normalizedEmail}`);
      throw new AccountLockedError();
    }
    
    // Validate credentials
    if (!user || user.status !== 'ACTIVE' || !isValidPassword) {
      // Record failed attempt if user exists
      if (user) {
        await UserModel.recordFailedLogin(user.id);
      }
      logger.warn(`Failed login attempt: ${normalizedEmail}`);
      throw new InvalidCredentialsError();
    }
    
    // Reset failed login counter on success
    await UserModel.resetFailedLogin(user.id);
    
    // Generate token and return safe user
    const safeUser = UserModel.toSafeUser(user);
    const token = generateToken(user.id, user.email);
    
    logger.success(`User logged in: ${user.email}`);
    
    return { user: safeUser, token };
  },
  
  /**
   * Register a new user
   */
  register: async (email, password, displayName) => {
    // Validate inputs
    validateRegistration(email, password, displayName);
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const existingUser = await DB.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }
    
    // Create user
    const passwordHash = await hashPassword(password);
    const user = await DB.createUser({
      email: normalizedEmail,
      displayName: displayName.trim(),
      passwordHash,
      status: 'ACTIVE',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
    });
    
    // Invalidate users cache
    await cache.delete(cacheKeys.allUsers());
    
    const safeUser = UserModel.toSafeUser(user);
    const token = generateToken(user.id, user.email);
    
    logger.success(`User registered: ${user.email}`);
    
    return { user: safeUser, token };
  },
  
  /**
   * Get user by ID with caching
   */
  getById: async (id) => {
    if (!isValidId(id)) {
      throw new ValidationError('Invalid user ID');
    }
    
    // Try cache first
    const cacheKey = cacheKeys.user(id);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch from DB
    const user = await DB.findUserById(id, { where: { deletedAt: null } });
    if (!user) {
      throw new NotFoundError('User');
    }
    
    const profile = UserModel.toPublicProfile(user);
    
    // Cache the result
    await cache.set(cacheKey, profile);
    
    return profile;
  },
  
  /**
   * Get all active users with caching
   */
  getAll: async () => {
    const cacheKey = cacheKeys.allUsers();
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const users = await DB.findAllUsers();
    const profiles = users.map(UserModel.toPublicProfile);
    
    await cache.set(cacheKey, profiles);
    
    return profiles;
  },
  
  /**
   * Record a failed login attempt
   */
  recordFailedLogin: async (userId) => {
    const user = await DB.findUserById(userId);
    if (!user) return;
    
    const newCount = user.failedLoginCount + 1;
    const updates = { failedLoginCount: newCount };
    
    // Lock account after max attempts
    if (newCount >= config.maxFailedLoginAttempts) {
      updates.lockedUntil = new Date(Date.now() + config.accountLockoutDurationMs);
      logger.warn(`Account locked after ${newCount} failed attempts: ${user.email}`);
    }
    
    await DB.updateUser(userId, updates);
  },
  
  /**
   * Reset failed login counter
   */
  resetFailedLogin: async (userId) => {
    await DB.updateUser(userId, {
      failedLoginCount: 0,
      lockedUntil: null,
    });
  },
  
  /**
   * Convert to safe user (for authenticated user)
   * Excludes sensitive fields like passwordHash
   */
  toSafeUser: (user) => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }),
  
  /**
   * Convert to public profile (for other users)
   * Excludes email and other private fields
   */
  toPublicProfile: (user) => ({
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }),
};

module.exports = UserModel;