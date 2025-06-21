
import React from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserManagement } from './UserManagement';
import { useAuth } from '@/components/auth/AuthWrapper';

interface RBACEnhancedUserManagementProps {
  organizationId: string;
  organizationName: string;
}

export const RBACEnhancedUserManagement: React.FC<RBACEnhancedUserManagementProps> = ({
  organizationId,
  organizationName
}) => {
  return (
    <PermissionGuard 
      permission="manage_users" 
      organizationId={organizationId}
      showRequiredRole={true}
    >
      <UserManagement
        organizationId={organizationId}
        organizationName={organizationName}
      />
    </PermissionGuard>
  );
};
