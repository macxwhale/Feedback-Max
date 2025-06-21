
import React from "react";
import { AdvancedDashboardView } from '../AdvancedDashboardView';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface AdvancedDashboardTabProps {
  organization: any;
  stats?: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLiveActivity: boolean;
  setIsLiveActivity: (isLive: boolean) => void;
  handleQuickActions: {
    onCreateQuestion: () => void;
    onInviteUser: () => void;
    onExportData: () => void;
    onViewSettings: () => void;
  };
}

export const AdvancedDashboardTab: React.FC<AdvancedDashboardTabProps> = ({
  organization,
  stats,
  activeTab,
  setActiveTab,
  isLiveActivity,
  setIsLiveActivity,
  handleQuickActions,
}) => (
  <PermissionGuard 
    permission="view_analytics" 
    organizationId={organization.id}
    showRequiredRole={true}
    fallback={
      <div className="text-center p-8">
        <p className="text-gray-500">You need viewer-level access or higher to view analytics.</p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your organization administrator for access.
        </p>
      </div>
    }
  >
    <AdvancedDashboardView
      organizationId={organization.id}
      organizationName={organization.name}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      stats={stats}
      isLiveActivity={isLiveActivity}
      setIsLiveActivity={setIsLiveActivity}
      handleQuickActions={handleQuickActions}
    />
  </PermissionGuard>
);

export default AdvancedDashboardTab;
