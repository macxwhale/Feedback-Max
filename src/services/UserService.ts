
/**
 * User Service Implementation
 * Implements IUserService following Domain-Driven Design principles
 */

import { supabase } from '@/integrations/supabase/client';
import {
  createError,
  createErrorResponse,
  createSuccessResponse,
  ERROR_CODES,
  handleUnknownError,
  logError,
  type ApiResponse,
} from '@/utils/errorHandler';
import {
  validateObject,
  VALIDATION_RULES,
} from '@/utils/validation';
import { logger } from '@/utils/logger';
import type {
  IUserService,
  User,
  InviteUserParams,
  InviteUserResponse,
  UpdateUserRoleParams,
  UserFilters,
  PaginatedUsers,
} from '@/domain/interfaces/IUserService';

/**
 * User Service Implementation
 * Handles user-related business logic
 */
export class UserService implements IUserService {
  /**
   * Get users with filtering and pagination
   */
  async getUsers(filters: UserFilters, page: number, limit: number): Promise<PaginatedUsers> {
    try {
      let query = supabase
        .from('organization_users')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('status', filters.isActive ? 'active' : 'inactive');
      }
      if (filters.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }

      // Apply pagination
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const users: User[] = (data || []).map(row => ({
        id: row.user_id,
        email: row.email,
        role: row.role as User['role'],
        organizationId: row.organization_id,
        isActive: row.status === 'active',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return {
        users,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > (page + 1) * limit,
      };

    } catch (error) {
      logger.error('Failed to get users', { filters, page, limit, error });
      throw handleUnknownError(error, 'Failed to retrieve users');
    }
  }

  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(error.message);
      }

      return {
        id: data.user_id,
        email: data.email,
        role: data.role as User['role'],
        organizationId: data.organization_id,
        isActive: data.status === 'active',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

    } catch (error) {
      logger.error('Failed to get user by ID', { userId, error });
      throw handleUnknownError(error, 'Failed to retrieve user');
    }
  }

  /**
   * Invite a user to an organization
   */
  async inviteUser(params: InviteUserParams): Promise<InviteUserResponse> {
    try {
      // Simple validation - convert params to compatible format
      const paramsRecord: Record<string, unknown> = {
        email: params.email,
        organizationId: params.organizationId,
        role: params.role,
        invitedBy: params.invitedBy,
      };

      const validation = validateObject(paramsRecord, {
        email: [VALIDATION_RULES.required('Email'), VALIDATION_RULES.email()],
        organizationId: [VALIDATION_RULES.required('Organization ID')],
        role: [VALIDATION_RULES.required('Role')],
        invitedBy: [VALIDATION_RULES.required('Invited By')],
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0]?.message || 'Validation failed',
        };
      }

      // Call the database function
      const { data, error } = await supabase.rpc('invite_user_to_organization', {
        p_email: params.email,
        p_organization_id: params.organizationId,
        p_role: params.role,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Type guard for the response data
      const result = data as { success?: boolean; invitation_id?: string; error?: string } | null;

      if (result?.success) {
        return {
          success: true,
          invitationId: result.invitation_id,
        };
      } else {
        return {
          success: false,
          error: result?.error || 'Invitation failed',
        };
      }

    } catch (error) {
      logger.error('Failed to invite user', { params, error });
      return {
        success: false,
        error: 'Failed to invite user. Please try again.',
      };
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(params: UpdateUserRoleParams): Promise<void> {
    try {
      // Simple validation - convert params to compatible format
      const paramsRecord: Record<string, unknown> = {
        userId: params.userId,
        role: params.role,
        updatedBy: params.updatedBy,
      };

      const validation = validateObject(paramsRecord, {
        userId: [VALIDATION_RULES.required('User ID')],
        role: [VALIDATION_RULES.required('Role')],
        updatedBy: [VALIDATION_RULES.required('Updated By')],
      });

      if (!validation.isValid) {
        throw createError(ERROR_CODES.VALIDATION_ERROR, validation.errors[0]?.message || 'Validation failed');
      }

      const { error } = await supabase
        .from('organization_users')
        .update({ role: params.role })
        .eq('user_id', params.userId);

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      logger.error('Failed to update user role', { params, error });
      throw handleUnknownError(error, 'Failed to update user role');
    }
  }

  /**
   * Deactivate a user
   */
  async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organization_users')
        .update({ status: 'inactive' })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      logger.error('Failed to deactivate user', { userId, deactivatedBy, error });
      throw handleUnknownError(error, 'Failed to deactivate user');
    }
  }

  /**
   * Reactivate a user
   */
  async reactivateUser(userId: string, reactivatedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organization_users')
        .update({ status: 'active' })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      logger.error('Failed to reactivate user', { userId, reactivatedBy, error });
      throw handleUnknownError(error, 'Failed to reactivate user');
    }
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    const result = await this.getUsers({ organizationId }, 0, 1000);
    return result.users;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // This is a simplified implementation
      // In a real application, you'd check against a permissions system
      const user = await this.getUserById(userId);
      
      if (!user) {
        return false;
      }

      // Basic role-based permissions
      switch (permission) {
        case 'manage_users':
          return ['super_admin', 'org_admin'].includes(user.role);
        case 'view_users':
          return ['super_admin', 'org_admin', 'member'].includes(user.role);
        default:
          return false;
      }

    } catch (error) {
      logger.error('Failed to check user permission', { userId, permission, error });
      return false;
    }
  }
}

/**
 * Default service instance
 */
export const userService = new UserService();
