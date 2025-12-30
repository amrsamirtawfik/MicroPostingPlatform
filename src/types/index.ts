// Domain types

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  passwordHash: string;
  status: UserStatus;
  failedLoginCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface SafeUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface PostWithAuthor extends Post {
  author: PublicProfile;
}

export interface AuthSession {
  user: SafeUser;
  token: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  order?: 'ASC' | 'DESC';
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}
