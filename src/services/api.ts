/**
 * API Service Layer (Frontend)
 * 
 * HTTP client that makes actual requests to the backend API.
 * Replaces direct model calls with fetch/axios requests.
 * 
 * Changes from original:
 * - ❌ REMOVED: Direct imports of UserModel, PostModel
 * - ✅ ADDED: HTTP requests using fetch API
 * - ✅ ADDED: Token injection for authenticated requests
 * - ✅ ADDED: Proper error handling
 */

import { 
  SafeUser, 
  PublicProfile, 
  Post, 
  PostWithAuthor,
  AuthSession,
  ApiResponse,
  PaginationOptions 
} from '@/types';

// Backend API base URL - configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('micropost_token');
};

/**
 * Make HTTP request with common configuration
 */
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Parse response
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      return {
        error: data.error || 'Request failed',
        code: data.code || 'UNKNOWN_ERROR',
      };
    }
    
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }
};

export const api = {
  // Auth endpoints
  auth: {
    /**
     * Login user
     */
    login: async (email: string, password: string): Promise<ApiResponse<AuthSession>> => {
      console.log('[API] POST /auth/login');
      return request<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    /**
     * Register new user
     */
    register: async (
      email: string, 
      password: string, 
      displayName: string
    ): Promise<ApiResponse<AuthSession>> => {
      console.log('[API] POST /auth/register');
      return request<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
      });
    },

    /**
     * Get current user (validate session)
     */
    me: async (token: string): Promise<ApiResponse<SafeUser>> => {
      console.log('[API] GET /auth/me');
      return request<SafeUser>('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },

  // User endpoints
  users: {
    /**
     * Get all users
     */
    getAll: async (): Promise<ApiResponse<PublicProfile[]>> => {
      console.log('[API] GET /users');
      return request<PublicProfile[]>('/users');
    },

    /**
     * Get user by ID
     */
    getById: async (userId: string): Promise<ApiResponse<PublicProfile>> => {
      console.log(`[API] GET /users/${userId}`);
      return request<PublicProfile>(`/users/${userId}`);
    },
  },

  // Post endpoints
  posts: {
    /**
     * Get all posts (feed)
     */
    getAll: async (options?: PaginationOptions): Promise<ApiResponse<PostWithAuthor[]>> => {
      console.log('[API] GET /posts');
      
      // Build query string
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.order) params.append('order', options.order);
      
      const query = params.toString();
      const endpoint = query ? `/posts?${query}` : '/posts';
      
      return request<PostWithAuthor[]>(endpoint);
    },

    /**
     * Get posts by user ID
     */
    getByUserId: async (
      userId: string, 
      options?: PaginationOptions
    ): Promise<ApiResponse<Post[]>> => {
      console.log(`[API] GET /users/${userId}/posts`);
      
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.order) params.append('order', options.order);
      
      const query = params.toString();
      const endpoint = query ? `/users/${userId}/posts?${query}` : `/users/${userId}/posts`;
      
      return request<Post[]>(endpoint);
    },

    /**
     * Get post by ID
     */
    getById: async (postId: string): Promise<ApiResponse<PostWithAuthor>> => {
      console.log(`[API] GET /posts/${postId}`);
      return request<PostWithAuthor>(`/posts/${postId}`);
    },

    /**
     * Create new post
     */
    create: async (userId: string, content: string): Promise<ApiResponse<Post>> => {
      console.log('[API] POST /posts');
      return request<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    /**
     * Delete post
     */
    delete: async (postId: string, userId: string): Promise<ApiResponse<boolean>> => {
      console.log(`[API] DELETE /posts/${postId}`);
      const response = await request<{ success: boolean }>(`/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (response.data) {
        return { data: response.data.success };
      }
      
      return { error: response.error, code: response.code };
    },
  },
};