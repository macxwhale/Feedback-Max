
import React from 'react';
import { ApiManagement } from '@/components/admin/integrations/ApiManagement';
import { SmsIntegrations } from '@/components/admin/integrations/SmsIntegrations';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useOrganization } from '@/hooks/useOrganization';

export const IntegrationsTab: React.FC = () => {
  const { isAdmin, isOrgAdmin } = useAuth();
  const { organization } = useOrganization();

  // Check if user has admin access (either system admin or org admin)
  const hasAdminAccess = isAdmin || isOrgAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">You need organization admin access to manage integrations.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Integrations</h2>
      <p className="text-muted-foreground">
        Connect your organization to other services and automate your workflows.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmsIntegrations />
        <ApiManagement />
      </div>
    </div>
  );
};

export default IntegrationsTab;
