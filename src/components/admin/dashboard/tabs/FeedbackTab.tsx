
import React from "react";
import { OrganizationSpecificStats } from '../../OrganizationSpecificStats';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface FeedbackTabProps {
  organizationId: string;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ organizationId }) => (
  <PermissionGuard 
    permission="export_data" 
    organizationId={organizationId}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need analyst-level access or higher to view detailed feedback analytics.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <OrganizationSpecificStats organizationId={organizationId} />
  </PermissionGuard>
);

export default FeedbackTab;
