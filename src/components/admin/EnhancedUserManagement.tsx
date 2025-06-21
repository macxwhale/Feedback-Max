
import React from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserManagement } from './UserManagement';

interface EnhancedUserManagementProps {
  organizationId: string;
  organizationName: string;
}

export const EnhancedUserManagement: React.FC<EnhancedUserManagementProps> = ({
  organizationId,
  organizationName
}) => {
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
