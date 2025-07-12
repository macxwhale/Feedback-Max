
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { useOrganizationStats } from '@/hooks/useOrganizationStats';
import { InformationRichDashboard } from './InformationRichDashboard';
import { SmartQuickActions } from './SmartQuickActions';
import { DashboardErrorBoundary, DashboardErrorFallback } from './DashboardErrorBoundary';

interface DashboardOverviewProps {
  organizationId: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  organizationId,
  onTabChange = () => {}
}) => {
  const { data: stats, isLoading, error, refetch } = useOrganizationStats(organizationId);

  if (error) {
    return <DashboardErrorFallback onRetry={() => refetch()} />;
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-8">
        {/* Information-Rich Dashboard */}
        <InformationRichDashboard 
          organizationId={organizationId}
          onTabChange={onTabChange}
        />

        {/* Enhanced Smart Quick Actions Panel */}
        <SmartQuickActions 
          onTabChange={onTabChange}
          stats={{
            pending_invitations: 2,
            unread_responses: stats?.total_responses ? Math.round(stats.total_responses * 0.12) : 0,
            active_sessions: stats?.total_sessions || 0,
            completion_rate: stats && stats.total_sessions > 0 
              ? Math.round((stats.completed_sessions / stats.total_sessions) * 100)
              : 0
          }}
        />
      </div>
    </DashboardErrorBoundary>
  );
};
