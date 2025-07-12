
import React from 'react';
import { Users, MessageSquare, Activity, Star, TrendingUp } from 'lucide-react';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { useDashboardData } from './DashboardDataProvider';

export const DashboardStatsGrid: React.FC = () => {
  const { stats, isLoading } = useDashboardData();

  const dashboardStats = [
    {
      id: 'members',
      title: 'Active Members',
      value: stats?.active_members ?? 0,
      icon: Users,
      trend: 'up' as const,
      trendValue: 12,
      color: 'blue' as const,
    },
    {
      id: 'responses',
      title: 'Total Responses',
      value: stats?.total_responses ?? 0,
      icon: MessageSquare,  
      trend: 'up' as const,
      trendValue: 8,
      color: 'green' as const,
    },
    {
      id: 'sessions',
      title: 'Active Sessions',
      value: stats?.total_sessions ?? 0,
      icon: Activity,
      color: 'purple' as const,
    },
    {
      id: 'rating',
      title: 'Avg Rating',
      value: stats?.avg_session_score ?? 0,
      format: 'rating' as const,
      icon: Star,
      color: 'orange' as const,
    },
  ];

  return (
    <StatsGrid
      stats={dashboardStats}
      isLoading={isLoading}
      columns={4}
    />
  );
};
