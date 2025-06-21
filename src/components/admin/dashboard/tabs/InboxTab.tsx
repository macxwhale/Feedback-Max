
import React from "react";
import { FeedbackInbox } from '../../inbox/FeedbackInbox';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface InboxTabProps {
  organizationId: string;
}

const InboxTab: React.FC<InboxTabProps> = ({ organizationId }) => {
  return (
    <PermissionGuard 
      permission="view_analytics" 
      organizationId={organizationId}
      showRequiredRole={true}
      fallback={
        <div className="text-center p-8">
          <p className="text-gray-500">You need viewer-level access or higher to view the feedback inbox.</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact your organization administrator for access.
          </p>
        </div>
      }
    >
      <FeedbackInbox organizationId={organizationId} />
    </PermissionGuard>
  );
};

export default InboxTab;
