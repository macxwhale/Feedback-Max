
import React from "react";
import { QuestionsManagement } from '../../QuestionsManagement';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export const QuestionsTab: React.FC = () => (
  <PermissionGuard 
    permission="manage_questions" 
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need analyst-level access or higher to manage questions.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <QuestionsManagement />
  </PermissionGuard>
);

export default QuestionsTab;
