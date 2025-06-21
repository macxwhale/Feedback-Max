
import React from "react";
import { SentimentAnalyticsDashboard } from '../SentimentAnalyticsDashboard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface SentimentTabProps {
  organizationId: string;
}

export const SentimentTab: React.FC<SentimentTabProps> = ({ organizationId }) => (
  <PermissionGuard 
    permission="view_analytics" 
    organizationId={organizationId}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need viewer-level access or higher to view sentiment analysis.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <SentimentAnalyticsDashboard organizationId={organizationId} />
  </PermissionGuard>
);

export default SentimentTab;
