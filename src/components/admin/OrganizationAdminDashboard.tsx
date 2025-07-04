
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrganization } from '@/context/OrganizationContext';
import { EnhancedDashboardLayout } from './dashboard/EnhancedDashboardLayout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { FloatingActionButton, ScrollToTopFAB } from '@/components/ui/floating-action-button';
import { H1, H2, Body } from '@/components/ui/typography';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { getOrganizationStatsEnhanced } from '@/services/organizationQueries';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { OrganizationStats } from '@/types/organizationStats';
import { Plus, Users, MessageSquare, Activity, Star, TrendingUp } from 'lucide-react';

// Tab components
import MembersTab from './dashboard/tabs/MembersTab';
import { FeedbackTab } from './dashboard/tabs/FeedbackTab';
import { QuestionsTab } from './dashboard/tabs/QuestionsTab';
import { SettingsTab } from './dashboard/tabs/SettingsTab';
import { IntegrationsTab } from './dashboard/tabs/IntegrationsTab';
import { SentimentTab } from './dashboard/tabs/SentimentTab';
import { PerformanceTab } from './dashboard/tabs/PerformanceTab';
import { CustomerInsightsTab } from './dashboard/tabs/CustomerInsightsTab';

// Import analytics components
import { AnalyticsTable } from './dashboard/AnalyticsTable';
import { AnalyticsInsights } from './dashboard/AnalyticsInsights';
import { SessionTrendsChart } from './dashboard/charts/SessionTrendsChart';

export const OrganizationAdminDashboard: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { organization, loading: orgLoading } = useOrganization();
  const [activeTab, setActiveTab] = useState('overview');
  const { isMobile } = useResponsiveDesign();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['organization-stats', organization?.id],
    queryFn: () => getOrganizationStatsEnhanced(organization!.id),
    enabled: !!organization?.id,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData(organization?.id || '');

  if (orgLoading || !organization) {
    return <div>Loading...</div>;
  }

  // Safe type conversion with proper fallbacks
  const typedStats: OrganizationStats | null = stats ? (stats as unknown as OrganizationStats) : null;

  const dashboardStats = [
    {
      id: 'members',
      title: 'Active Members',
      value: typedStats?.active_members ?? 0,
      icon: Users,
      trend: 'up' as const,
      trendValue: 12,
      color: 'blue' as const,
    },
    {
      id: 'responses',
      title: 'Total Responses',
      value: typedStats?.total_responses ?? 0,
      icon: MessageSquare,  
      trend: 'up' as const,
      trendValue: 8,
      color: 'green' as const,
    },
    {
      id: 'sessions',
      title: 'Active Sessions',
      value: typedStats?.total_sessions ?? 0,
      icon: Activity,
      color: 'purple' as const,
    },
    {
      id: 'rating',
      title: 'Avg Rating',
      value: typedStats?.avg_session_score ?? 0,
      format: 'rating' as const,
      icon: Star,
      color: 'orange' as const,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return <MembersTab organization={organization} />;
      case 'feedback':
        return <FeedbackTab organizationId={organization.id} />;
      case 'questions':
        return <QuestionsTab />;
      case 'settings':
        return <SettingsTab organization={organization} />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'sentiment':
        return <SentimentTab organizationId={organization.id} />;
      case 'performance':
        return <PerformanceTab organizationId={organization.id} />;
      case 'customer-insights':
        return <CustomerInsightsTab organizationId={organization.id} />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <H1 className="mb-2">Analytics Dashboard</H1>
              <Body>Here's what's happening with {organization.name} today.</Body>
            </div>
            
            <StatsGrid
              stats={dashboardStats}
              isLoading={statsLoading}
              columns={4}
            />

            {/* Trend Analysis Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <H2 className="mb-4">Trend Analysis</H2>
              <Body className="text-gray-600 mb-4">Key metrics over the selected period</Body>
              <SessionTrendsChart isLoading={statsLoading} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analytics Dashboard Table */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <H2>Analytics Dashboard</H2>
                </div>
                <AnalyticsTable 
                  questions={analyticsData?.questions || []}
                  categories={analyticsData?.categories || []}
                  summary={analyticsData?.summary || {
                    total_questions: typedStats?.total_questions ?? 0,
                    total_responses: typedStats?.total_responses ?? 0,
                    overall_avg_score: typedStats?.avg_session_score ?? 0,
                    overall_completion_rate: typedStats?.completed_sessions && typedStats?.total_sessions 
                      ? Math.round((typedStats.completed_sessions / typedStats.total_sessions) * 100)
                      : 0
                  }}
                />
              </div>
              
              {/* Analytics Insights */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <H2>Analytics Insights</H2>
                </div>
                <div className="p-6">
                  <AnalyticsInsights 
                    stats={typedStats ? {
                      total_questions: typedStats.total_questions,
                      total_responses: typedStats.total_responses,
                      total_sessions: typedStats.total_sessions,
                      completed_sessions: typedStats.completed_sessions,
                      active_members: typedStats.active_members,
                      avg_session_score: typedStats.avg_session_score,
                      growth_metrics: typedStats.growth_metrics || {
                        sessions_this_month: 0,
                        sessions_last_month: 0,
                        growth_rate: null
                      }
                    } : undefined}
                    isLoading={statsLoading}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <H2 className="mb-4">Quick Actions</H2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('members')}
                  className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Invite new members</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span>Create new question</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <EnhancedDashboardLayout
        organizationName={organization.name}
        organizationId={organization.id}
        organizationSlug={slug || ''}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={typedStats}
        isLoading={statsLoading}
      >
        {renderTabContent()}
      </EnhancedDashboardLayout>
      
      {/* Floating Action Button for mobile */}
      {isMobile && activeTab === 'overview' && (
        <FloatingActionButton
          onClick={() => setActiveTab('members')}
          extended
        >
          <Plus className="w-5 h-5" />
          Quick Action
        </FloatingActionButton>
      )}
      
      <ScrollToTopFAB />
    </>
  );
};
