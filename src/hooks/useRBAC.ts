
import { useAuth } from '@/components/auth/AuthWrapper';
import { useQuery } from '@tanstack/react-query';
import { RBACService, type RBACContext, type PermissionResult } from '@/services/rbacService';
import { useCallback, useMemo } from 'react';
import { hasPermission, canManageRole } from '@/utils/enhancedRoleUtils';

export const useRBAC = (organizationId?: string) => {
  const { user, isAdmin } = useAuth();

  const context = useMemo<RBACContext | null>(() => {
    if (!user?.id || !organizationId) return null;
    return {
      userId: user.id,
      organizationId,
      isAdmin
    };
  }, [user?.id, organizationId, isAdmin]);

  const { data: userRole, isLoading } = useQuery({
    queryKey: ['user-role-rbac', user?.id, organizationId],
    queryFn: () => context ? RBACService.getUserRole(context.userId, context.organizationId) : null,
    enabled: !!context,
    staleTime: 5 * 60 * 1000,
  });

  const checkPermission = useCallback(async (
    permission: string,
    targetUserId?: string
  ): Promise<PermissionResult> => {
    if (!context) {
      return { allowed: false, reason: 'No valid context' };
    }

    return RBACService.checkPermission(
      { ...context, userRole: userRole || undefined },
      permission,
      targetUserId
    );
  }, [context, userRole]);

  const requirePermission = useCallback(async (
    permission: string,
    targetUserId?: string
  ): Promise<void> => {
    if (!context) {
      throw new Error('No valid RBAC context');
    }

    return RBACService.requirePermission(
      { ...context, userRole: userRole || undefined },
      permission,
      targetUserId
    );
  }, [context, userRole]);

  const hasPermissionCheck = useCallback((permission: string): boolean => {
    if (!context || !userRole) return false;
    if (isAdmin) return true;
    
    return hasPermission(userRole, permission);
  }, [context, userRole, isAdmin]);

  const canManageUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!context || !userRole) return false;
    if (isAdmin) return true;

    const targetRole = await RBACService.getUserRole(targetUserId, context.organizationId);
    if (!targetRole) return false;

    return canManageRole(userRole, targetRole);
  }, [context, userRole, isAdmin]);

  return {
    userRole,
    isLoading,
    checkPermission,
    requirePermission,
    hasPermission: hasPermissionCheck,
    canManageUser,
    isAdmin: isAdmin || false
  };
};
