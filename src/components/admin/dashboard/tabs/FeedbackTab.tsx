
import React from "react";
import { EnhancedFeedbackAnalytics } from '../EnhancedFeedbackAnalytics';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface FeedbackTabProps {
  organizationId: string;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ organizationId }) => (
  <PermissionGuard 
    permission="view_analytics" 
    organizationId={organizationId}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need viewer-level access or higher to view detailed feedback analytics.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <EnhancedFeedbackAnalytics organizationId={organizationId} />
  </PermissionGuard>
);

export default FeedbackTab;
