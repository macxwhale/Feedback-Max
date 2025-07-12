
import React from "react";
import { PerformanceAnalyticsDashboard } from '../PerformanceAnalyticsDashboard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface PerformanceTabProps {
  organizationId: string;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ organizationId }) => (
  <PermissionGuard 
    permission="view_analytics" 
    organizationId={organizationId}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need viewer-level access or higher to view performance analytics.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <PerformanceAnalyticsDashboard organizationId={organizationId} />
  </PermissionGuard>
);

export default PerformanceTab;
