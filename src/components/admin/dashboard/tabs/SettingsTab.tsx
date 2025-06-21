
import React from "react";
import { OrganizationSettingsTab } from '../../OrganizationSettingsTab';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface SettingsTabProps {
  organization: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ organization }) => (
  <PermissionGuard 
    permission="manage_organization" 
    organizationId={organization.id}
    showRequiredRole={true}
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

export default SettingsTab;
