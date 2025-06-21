
import { useAuth } from '@/components/auth/AuthWrapper';
import { useQuery } from '@tanstack/react-query';
import { RBACService, type RBACContext, type PermissionResult } from '@/services/rbacService';
import { useCallback, useMemo } from 'react';

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
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  const hasPermission = useCallback((permission: string): boolean => {
    if (!context || !userRole) return false;
    if (isAdmin) return true;
    
    // Use the existing permission check from utils
    return require('@/utils/enhancedRoleUtils').hasPermission(userRole, permission);
  }, [context, userRole, isAdmin]);

  const canManageUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!context || !userRole) return false;
    if (isAdmin) return true;

    const targetRole = await RBACService.getUserRole(targetUserId, context.organizationId);
    if (!targetRole) return false;

    return require('@/utils/enhancedRoleUtils').canManageRole(userRole, targetRole);
  }, [context, userRole, isAdmin]);

  return {
    userRole,
    isLoading,
    checkPermission,
    requirePermission,
    hasPermission,
    canManageUser,
    isAdmin: isAdmin || false
  };
};

// Higher-order component for protecting routes/components
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  organizationId?: string
) => {
  return function ProtectedComponent(props: P) {
    const { hasPermission, isLoading } = useRBAC(organizationId);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!hasPermission(requiredPermission)) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Access denied. Required permission: {requiredPermission}</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
