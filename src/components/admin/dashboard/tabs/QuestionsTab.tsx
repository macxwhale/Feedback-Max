
import React from "react";
import { QuestionsManagement } from '../../QuestionsManagement';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useOrganization } from '@/hooks/useOrganization';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export const QuestionsTab: React.FC = () => {
  const { isAdmin, isOrgAdmin } = useAuth();
  const { organization } = useOrganization();

  // Check if user has admin access (either system admin or org admin)
  const hasAdminAccess = isAdmin || isOrgAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">You need organization admin access to manage questions.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    );
  }

  return (
    <PermissionGuard 
      permission="view_analytics" 
      organizationId={organization?.id}
      showRequiredRole={true}
      fallback={
        <div className="text-center p-8">
          <p className="text-gray-500">You need admin-level access or higher to manage questions.</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact your organization administrator for access.
          </p>
        </div>
      }
    >
      <QuestionsManagement />
    </PermissionGuard>
  );
};

export default QuestionsTab;
