import { useAuth } from '@/components/auth/AuthWrapper';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { hasPermission } from '@/utils/roleManagement';

interface Permission {
  allowed: boolean;
  restrictions?: string[];
}

export const useEnhancedPermissions = (organizationId?: string) => {
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['user-enhanced-role', user?.id, organizationId],
    queryFn: async () => {
      if (!user?.id || !organizationId) return null;
      
      const { data } = await supabase
        .from('organization_users')
        .select('enhanced_role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();
        
      return data?.enhanced_role || null;
    },
    enabled: !!user?.id && !!organizationId,
  });

  const { data: permissions } = useQuery({
    queryKey: ['user-permissions', user?.id, organizationId, userRole],
    queryFn: async () => {
      if (!user?.id || !organizationId || !userRole) return {};
      
      const { data } = await supabase
        .from('role_permissions')
        .select('permission_key, permission_value')
        .eq('role', userRole);
        
      const permissionsMap: Record<string, Permission> = {};
      data?.forEach(({ permission_key, permission_value }) => {
        // Safely parse the permission_value as Permission interface
        try {
          const parsedPermission = permission_value as unknown as Permission;
          if (parsedPermission && typeof parsedPermission === 'object' && 'allowed' in parsedPermission) {
            permissionsMap[permission_key] = parsedPermission;
          }
        } catch (error) {
          console.warn(`Failed to parse permission for ${permission_key}:`, error);
        }
      });
      
      return permissionsMap;
    },
    enabled: !!user?.id && !!organizationId && !!userRole,
  });

  const checkPermission = (permission: string): boolean => {
    if (!userRole) return false;
    
    // Check database permissions first
    const dbPermission = permissions?.[permission];
    if (dbPermission) {
      return dbPermission.allowed;
    }
    
    // Fallback to role-based permission check
    return hasPermission(userRole, permission);
  };

  const canManageUsers = () => checkPermission('manage_users');
  const canManageOrganization = () => checkPermission('manage_organization');
  const canViewAnalytics = () => checkPermission('view_analytics');
  const canExportData = () => checkPermission('export_data');
  const canManageQuestions = () => checkPermission('manage_questions');
  const canManageIntegrations = () => checkPermission('manage_integrations');
  const canManageBilling = () => checkPermission('manage_billing');

  return {
    userRole,
    permissions,
    checkPermission,
    canManageUsers,
    canManageOrganization,
    canViewAnalytics,
    canExportData,
    canManageQuestions,
    canManageIntegrations,
    canManageBilling,
  };
};
