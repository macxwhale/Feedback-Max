
import React from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserManagement } from './UserManagement';
import { useRBAC } from '@/hooks/useRBAC';

interface EnhancedUserManagementProps {
  organizationId: string;
  organizationName: string;
}

export const EnhancedUserManagement: React.FC<EnhancedUserManagementProps> = ({
  organizationId,
  organizationName
}) => {
  const { userRole, isLoading, hasPermission } = useRBAC(organizationId);

  console.log('EnhancedUserManagement:', {
    organizationId,
    userRole,
    isLoading,
    hasManageUsersPermission: hasPermission('manage_users')
  });

  return (
    <PermissionGuard 
      permission="manage_users" 
      organizationId={organizationId}
      showRequiredRole={true}
      fallback={
        <div className="text-center p-8">
          <p className="text-gray-500">You need manager-level access or higher to manage users.</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact your organization administrator for access.
          </p>
          {userRole && (
            <p className="text-xs text-gray-400 mt-1">
              Current role: {userRole}
            </p>
          )}
        </div>
      }
    >
      <UserManagement
        organizationId={organizationId}
        organizationName={organizationName}
      />
    </PermissionGuard>
  );
};
