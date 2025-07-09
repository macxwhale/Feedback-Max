
import React from "react";
import { EnhancedFeedbackInbox } from '@/components/admin/inbox/EnhancedFeedbackInbox';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface InboxTabProps {
  organizationId: string;
}

export const InboxTab: React.FC<InboxTabProps> = ({ organizationId }) => (
  <PermissionGuard 
    permission="view_analytics" 
    organizationId={organizationId}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need viewer-level access or higher to view feedback responses.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <EnhancedFeedbackInbox organizationId={organizationId} />
  </PermissionGuard>
);

export default InboxTab;
