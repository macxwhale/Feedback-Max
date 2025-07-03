/**
 * User Service Implementation
 * Handles all user-related business logic
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  IUserService, 
  User, 
  InviteUserParams, 
  InviteUserResponse,
  UpdateUserRoleParams,
  UserFilters,
  PaginatedUsers
} from '@/domain/interfaces/IUserService';
import { errorHandler, ErrorCodes } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

export class UserService implements IUserService {
  async getUsers(filters: UserFilters, page: number = 1, limit: number = 10): Promise<PaginatedUsers> {
    return errorHandler.handleAsync(async () => {
      let query = supabase
        .from('all_users_with_org')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to fetch users: ${error.message}`,
          'high',
          { filters, page, limit }
        );
      }

      const users: User[] = (data || []).map(row => ({
        id: row.user_id,
        email: row.email,
        role: row.role as User['role'],
        organizationId: row.organization_id,
        isActive: row.status === 'active',
        createdAt: row.organization_user_created_at,
        updatedAt: row.organization_user_created_at,
      }));

      return {
        users,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit,
      };
    }, { operation: 'getUsers', filters, page, limit });
  }

  async getUserById(userId: string): Promise<User | null> {
    return errorHandler.handleAsync(async () => {
      const { data, error } = await supabase
        .from('all_users_with_org')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to fetch user: ${error.message}`,
          'medium',
          { userId }
        );
      }

      if (!data) {
        return null;
      }

      return {
        id: data.user_id,
        email: data.email,
        role: data.role as User['role'],
        organizationId: data.organization_id,
        isActive: data.status === 'active',
        createdAt: data.organization_user_created_at,
        updatedAt: data.organization_user_created_at,
      };
    }, { operation: 'getUserById', userId });
  }

  async inviteUser(params: InviteUserParams): Promise<InviteUserResponse> {
    return errorHandler.handleAsync(async () => {
      logger.info('Inviting user', { email: params.email, organizationId: params.organizationId });

      const { data, error } = await supabase.functions.invoke('enhanced-invite-user', {
        body: {
          email: params.email,
          organization_id: params.organizationId,
          role: params.role,
          invited_by: params.invitedBy,
        },
      });

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to invite user: ${error.message}`,
          'high',
          params as Record<string, unknown>
        );
      }

      return {
        success: data?.success || false,
        invitationId: data?.invitation_id,
        error: data?.error,
      };
    }, { operation: 'inviteUser', email: params.email });
  }

  async updateUserRole(params: UpdateUserRoleParams): Promise<void> {
    return errorHandler.handleAsync(async () => {
      // Use Edge Function for role updates to maintain proper permissions
      const { error } = await supabase.functions.invoke('system-user-management', {
        body: {
          action: 'update_role',
          user_id: params.userId,
          role: params.role,
          updated_by: params.updatedBy,
        },
      });

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to update user role: ${error.message}`,
          'high',
          params as Record<string, unknown>
        );
      }

      logger.info('User role updated', { 
        userId: params.userId, 
        role: params.role,
        updatedBy: params.updatedBy 
      });
    }, { operation: 'updateUserRole', ...params });
  }

  async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    return errorHandler.handleAsync(async () => {
      const { error } = await supabase.functions.invoke('system-user-management', {
        body: {
          action: 'deactivate_user',
          user_id: userId,
          deactivated_by: deactivatedBy,
        },
      });

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to deactivate user: ${error.message}`,
          'high',
          { userId, deactivatedBy }
        );
      }

      logger.info('User deactivated', { userId, deactivatedBy });
    }, { operation: 'deactivateUser', userId, deactivatedBy });
  }

  async reactivateUser(userId: string, reactivatedBy: string): Promise<void> {
    return errorHandler.handleAsync(async () => {
      const { error } = await supabase.functions.invoke('system-user-management', {
        body: {
          action: 'reactivate_user',
          user_id: userId,
          reactivated_by: reactivatedBy,
        },
      });

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to reactivate user: ${error.message}`,
          'high',
          { userId, reactivatedBy }
        );
      }

      logger.info('User reactivated', { userId, reactivatedBy });
    }, { operation: 'reactivateUser', userId, reactivatedBy });
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return errorHandler.handleAsync(async () => {
      const { data, error } = await supabase
        .from('all_users_with_org')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error) {
        throw errorHandler.createError(
          ErrorCodes.SERVER_ERROR,
          `Failed to fetch organization users: ${error.message}`,
          'medium',
          { organizationId }
        );
      }

      return (data || []).map(row => ({
        id: row.user_id,
        email: row.email,
        role: row.role as User['role'],
        organizationId: row.organization_id,
        isActive: row.status === 'active',
        createdAt: row.organization_user_created_at,
        updatedAt: row.organization_user_created_at,
      }));
    }, { operation: 'getUsersByOrganization', organizationId });
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    return errorHandler.handleAsync(async () => {
      // Get user's role and check permissions
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }

      // Define permission matrix
      const permissions = {
        super_admin: ['*'], // All permissions
        org_admin: ['manage_users', 'view_analytics', 'manage_settings'],
        member: ['view_analytics'],
        viewer: ['view_analytics'],
      };

      const userPermissions = permissions[user.role] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    }, { operation: 'hasPermission', userId, permission });
  }
}