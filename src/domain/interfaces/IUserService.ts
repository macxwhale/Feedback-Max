
/**
 * User Service Interface
 * Defines contract for user operations
 */

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'org_admin' | 'member' | 'viewer';
  organizationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteUserParams {
  email: string;
  organizationId: string;
  role: User['role'];
  invitedBy: string;
}

export interface InviteUserResponse {
  success: boolean;
  invitationId?: string;
  error?: string;
}

export interface UpdateUserRoleParams {
  userId: string;
  role: User['role'];
  updatedBy: string;
}

export interface UserFilters {
  organizationId?: string;
  role?: User['role'];
  isActive?: boolean;
  search?: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IUserService {
  /**
   * Get users with filtering and pagination
   */
  getUsers(filters: UserFilters, page: number, limit: number): Promise<PaginatedUsers>;

  /**
   * Get a user by ID
   */
  getUserById(userId: string): Promise<User | null>;

  /**
   * Get user by ID (alias for compatibility)
   */
  getUser(userId: string): Promise<User | null>;

  /**
   * Update user profile
   */
  updateUser(userId: string, updates: Partial<User>): Promise<User>;

  /**
   * Invite a user to an organization
   */
  inviteUser(params: InviteUserParams): Promise<InviteUserResponse>;

  /**
   * Update user role
   */
  updateUserRole(params: UpdateUserRoleParams): Promise<void>;

  /**
   * Deactivate a user
   */
  deactivateUser(userId: string, deactivatedBy: string): Promise<void>;

  /**
   * Reactivate a user
   */
  reactivateUser(userId: string, reactivatedBy: string): Promise<void>;

  /**
   * Get users by organization
   */
  getUsersByOrganization(organizationId: string): Promise<User[]>;

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, permission: string): Promise<boolean>;
}
