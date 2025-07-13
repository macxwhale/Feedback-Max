
import React from "react";
import { OrganizationSettingsTab } from '../../OrganizationSettingsTab';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAccessRequest } from '@/hooks/useAccessRequest';

interface SettingsTabProps {
  organization: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ organization }) => {
  const { submitAccessRequest, isSubmitting } = useAccessRequest();

  const handleRequestAccess = async () => {
    await submitAccessRequest({
      requestType: 'permission',
      requestedPermission: 'manage_organization',
      reason: 'Need access to manage organization settings'
    });
  };

  return (
    <PermissionGuard 
      permission="manage_organization" 
      organizationId={organization.id}
      showRequiredRole={true}
      onRequestAccess={handleRequestAccess}
      fallback={
        <div className="text-center p-8">
          <p className="text-gray-500">You need admin-level access or higher to manage organization settings.</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact your organization administrator for access.
          </p>
        </div>
      }
    >
      <OrganizationSettingsTab organization={organization} />
    </PermissionGuard>
  );
};

export default SettingsTab;
