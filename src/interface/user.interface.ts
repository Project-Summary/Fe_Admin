// File: interface/user.interface.ts

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
}

export interface Preferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
}

export interface ViewHistoryItem {
  contentId: string;
  contentType: 'movie' | 'story';
  viewedAt: Date;
}

export interface UserStatistics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  watchlist: string[];
  viewHistory: ViewHistoryItem[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  statistics?: UserStatistics;
  preferences?: Preferences;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new user
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole; // Make required to match form
  avatar?: string;
  isActive?: boolean;
  preferences?: Preferences;
}

// DTO for regular user updates (limited fields)
export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  preferences?: Preferences;
  
  // Fields not allowed for regular users
  email?: any;
  password?: any;
  role?: any;
  isActive?: boolean;
}

// DTO for admin user updates (all fields allowed)
export interface AdminUpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: Preferences;
  
  // Admin cannot change password directly
  password?: any;
}

// Bulk operations interfaces
export interface BulkUserUpdate {
  userIds: string[];
  updates: {
    role?: UserRole;
    isActive?: boolean;
    name?: string;
    avatar?: string;
  };
}

export interface BulkOperationResult {
  success: boolean;
  totalRequested: number;
  successful: number;
  failed: number;
  successfulIds: string[];
  failedOperations: Array<{
    userId: string;
    error: string;
  }>;
  message: string;
}

// User filters and pagination
export interface UserFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | 'all';
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  includeAllStatuses?: boolean;
}

// Login/Auth interfaces
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// User stats interface for dashboard
export interface UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsers: number;
  roleDistribution: {
    [UserRole.ADMIN]: number;
    [UserRole.MODERATOR]: number;
    [UserRole.USER]: number;
  };
  lastRegisteredDate: Date;
}