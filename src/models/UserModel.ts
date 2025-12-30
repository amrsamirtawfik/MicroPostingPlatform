/**
 * User Model
 * 
 * Contains all user-related business logic.
 * Authorization and validation happen at this layer.
 */

import { User, SafeUser, PublicProfile } from '@/types';
import { DB } from '@/infrastructure/database';
import { cache, cacheKeys } from '@/infrastructure/cache';
import { 
  InvalidCredentialsError, 
  InvalidInputError, 
  NotFoundError,
  AccountLockedError 
} from '@/lib/errors';
import { 
  isValidEmail, 
  isNonEmptyString, 
  isValidId,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS 
} from '@/lib/validators';
import { 
  verifyPassword, 
  hashPassword, 
  DUMMY_PASSWORD_HASH,
  generateToken 
} from '@/lib/crypto';

export const UserModel = {
  /**
   * Authenticate user with email and password
   * Implements security best practices:
   * - Constant-time comparison to prevent timing attacks
   * - Account lockout after failed attempts
   * - No user enumeration (same error for any failure)
   */
  authenticate: async (email: string, password: string): Promise<{ user: SafeUser; token: string }> => {
    // Input validation
    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      throw new InvalidCredentialsError();
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user with required fields
    const user = await DB.findUserByEmail(normalizedEmail, {
      select: ['id', 'email', 'displayName', 'avatarUrl', 'passwordHash', 'status', 'failedLoginCount', 'lockedUntil']
    }) as User | null;

    // Use dummy hash if user doesn't exist (prevents timing attacks)
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isValidPassword = await verifyPassword(password, passwordHash);

    // Check account lock
    if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new AccountLockedError();
    }

    // Validate credentials
    if (!user || user.status !== 'ACTIVE' || !isValidPassword) {
      // Record failed attempt if user exists
      if (user) {
        await UserModel.recordFailedLogin(user.id);
      }
      throw new InvalidCredentialsError();
    }

    // Reset failed login counter on success
    await UserModel.resetFailedLogin(user.id);

    // Generate token and return safe user
    const safeUser = UserModel.toSafeUser(user);
    const token = generateToken(user.id, user.email);

    return { user: safeUser, token };
  },

  /**
   * Register a new user
   */
  register: async (email: string, password: string, displayName: string): Promise<{ user: SafeUser; token: string }> => {
    if (!isValidEmail(email)) {
      throw new InvalidInputError('Invalid email format');
    }
    if (!isNonEmptyString(password) || password.length < 8) {
      throw new InvalidInputError('Password must be at least 8 characters');
    }
    if (!isNonEmptyString(displayName) || displayName.length < 2) {
      throw new InvalidInputError('Display name must be at least 2 characters');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await DB.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new InvalidInputError('Email already registered');
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

    return { user: safeUser, token };
  },

  /**
   * Get user by ID with caching
   */
  getById: async (id: string): Promise<PublicProfile> => {
    if (!isValidId(id)) {
      throw new InvalidInputError('Invalid user ID');
    }

    // Try cache first
    const cacheKey = cacheKeys.user(id);
    const cached = await cache.get<PublicProfile>(cacheKey);
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
  getAll: async (): Promise<PublicProfile[]> => {
    const cacheKey = cacheKeys.allUsers();
    const cached = await cache.get<PublicProfile[]>(cacheKey);
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
  recordFailedLogin: async (userId: string): Promise<void> => {
    const user = await DB.findUserById(userId);
    if (!user) return;

    const newCount = user.failedLoginCount + 1;
    const updates: Partial<User> = { failedLoginCount: newCount };

    // Lock account after max attempts
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await DB.updateUser(userId, updates);
  },

  /**
   * Reset failed login counter
   */
  resetFailedLogin: async (userId: string): Promise<void> => {
    await DB.updateUser(userId, {
      failedLoginCount: 0,
      lockedUntil: null,
    });
  },

  /**
   * Convert to safe user (for authenticated user)
   */
  toSafeUser: (user: User | Partial<User>): SafeUser => ({
    id: user.id!,
    email: user.email!,
    displayName: user.displayName!,
    avatarUrl: user.avatarUrl,
  }),

  /**
   * Convert to public profile (for other users)
   */
  toPublicProfile: (user: User): PublicProfile => ({
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }),
};
