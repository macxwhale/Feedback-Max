
import React from "react";
import { CustomerInsightsDashboard } from '../CustomerInsightsDashboard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface CustomerInsightsTabProps {
  organizationId: string;
}

export const CustomerInsightsTab: React.FC<CustomerInsightsTabProps> = ({ organizationId }) => (
  <PermissionGuard 
    permission="view_analytics" 
    organizationId={organizationId}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need viewer-level access or higher to view customer insights.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <CustomerInsightsDashboard organizationId={organizationId} />
  </PermissionGuard>
);

export default CustomerInsightsTab;
