/**
 * API Service Layer
 * 
 * Centralized API client that simulates HTTP calls to the backend.
 * In production, this would make actual fetch/axios calls.
 * 
 * This layer provides:
 * - Consistent error handling
 * - Request/response logging
 * - Token injection for authenticated requests
 */

import { UserModel } from '@/models/UserModel';
import { PostModel } from '@/models/PostModel';
import { 
  SafeUser, 
  PublicProfile, 
  Post, 
  PostWithAuthor,
  AuthSession,
  ApiResponse,
  PaginationOptions 
} from '@/types';
import { AppError } from '@/lib/errors';

// Simulate network delay for realism
const simulateLatency = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 200 + 100)
);

// Helper to wrap responses
const handleRequest = async <T>(
  operation: () => Promise<T>
): Promise<ApiResponse<T>> => {
  await simulateLatency();
  
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message, code: error.code };
    }
    return { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
  }
};

export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<AuthSession>> => {
      console.log('[API] POST /auth/login');
      return handleRequest(async () => {
        const result = await UserModel.authenticate(email, password);
        return result;
      });
    },

    register: async (
      email: string, 
      password: string, 
      displayName: string
    ): Promise<ApiResponse<AuthSession>> => {
      console.log('[API] POST /auth/register');
      return handleRequest(async () => {
        const result = await UserModel.register(email, password, displayName);
        return result;
      });
    },

    // Validate token and get user (for session restoration)
    me: async (token: string): Promise<ApiResponse<SafeUser>> => {
      console.log('[API] GET /auth/me');
      return handleRequest(async () => {
        // In a real app, we'd verify the JWT and fetch user
        // For mock, we decode the token
        const { verifyToken } = await import('@/lib/crypto');
        const payload = verifyToken(token);
        if (!payload) {
          throw new Error('Invalid token');
        }
        const profile = await UserModel.getById(payload.userId);
        return {
          id: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          email: payload.email,
        };
      });
    },
  },

  // User endpoints
  users: {
    getAll: async (): Promise<ApiResponse<PublicProfile[]>> => {
      console.log('[API] GET /users');
      return handleRequest(() => UserModel.getAll());
    },

    getById: async (userId: string): Promise<ApiResponse<PublicProfile>> => {
      console.log(`[API] GET /users/${userId}`);
      return handleRequest(() => UserModel.getById(userId));
    },
  },

  // Post endpoints
  posts: {
    getAll: async (options?: PaginationOptions): Promise<ApiResponse<PostWithAuthor[]>> => {
      console.log('[API] GET /posts');
      return handleRequest(() => PostModel.getAllWithAuthors(options));
    },

    getByUserId: async (
      userId: string, 
      options?: PaginationOptions
    ): Promise<ApiResponse<Post[]>> => {
      console.log(`[API] GET /users/${userId}/posts`);
      return handleRequest(() => PostModel.getByUserId(userId, options));
    },

    getById: async (postId: string): Promise<ApiResponse<PostWithAuthor>> => {
      console.log(`[API] GET /posts/${postId}`);
      return handleRequest(() => PostModel.getById(postId));
    },

    create: async (userId: string, content: string): Promise<ApiResponse<Post>> => {
      console.log('[API] POST /posts');
      return handleRequest(() => PostModel.create(userId, content));
    },

    delete: async (postId: string, userId: string): Promise<ApiResponse<boolean>> => {
      console.log(`[API] DELETE /posts/${postId}`);
      return handleRequest(() => PostModel.deleteOwned(postId, userId));
    },
  },
};
