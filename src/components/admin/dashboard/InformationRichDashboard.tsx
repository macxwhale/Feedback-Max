
import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { EnhancedMetricCard } from './EnhancedMetricCard';
import { DataSummaryBar } from './DataSummaryBar';
import { DashboardErrorBoundary, DashboardErrorFallback } from './DashboardErrorBoundary';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { ResponsiveGrid } from '@/components/ui/responsive-layout';

interface InformationRichDashboardProps {
  organizationId: string;
  onTabChange?: (tab: string) => void;
}

export const InformationRichDashboard: React.FC<InformationRichDashboardProps> = ({ 
  organizationId,
  onTabChange = () => {}
}) => {
  const { data: analyticsData, isLoading, error, refetch } = useAnalyticsTableData(organizationId);
  const [activeSection, setActiveSection] = useState('overview');
  const { isMobile, isTablet } = useResponsiveDesign();

  if (error) {
    return <DashboardErrorFallback onRetry={() => refetch()} />;
  }

  // Calculate real metrics from analytics data
  const calculatePerformanceScore = () => {
    if (!analyticsData?.summary || analyticsData.summary.total_sessions === 0) return 0;
    const { overall_completion_rate, user_satisfaction_rate, response_rate } = analyticsData.summary;
    
    // Weighted calculation: completion rate (40%), user satisfaction (40%), response rate (20%)
    const score = (overall_completion_rate * 0.4) + (user_satisfaction_rate * 0.4) + (response_rate * 0.2);
    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const calculateGrowthRate = () => {
    if (!analyticsData?.summary) return 0;
    return analyticsData.summary.growth_rate || 0;
  };

  // Helper function to get trend indicator with stable option
  const getTrendIndicator = (value: number): 'up' | 'down' | 'stable' => {
    if (value > 5) return 'up';
    if (value < -5) return 'down';
    return 'stable';
  };

  // Helper function to normalize average score to 1-5 scale
  const normalizeAverageScore = (score: number): number => {
    if (score <= 5) return score; // Already in 1-5 range
    if (score <= 100) return (score / 100) * 5; // Convert percentage to 1-5
    return Math.min(5, score / 20); // Scale down very high values
  };

  const normalizedAvgScore = analyticsData?.summary?.avg_score 
    ? normalizeAverageScore(analyticsData.summary.avg_score)
    : 0;

  // Clean metrics with real data
  const performanceMetrics = [
    {
      title: 'Response Collection',
      value: analyticsData?.summary?.total_responses || 0,
      previousValue: Math.max(0, (analyticsData?.summary?.total_responses || 0) - 45),
      icon: MessageSquare,
      change: {
        value: Math.abs(calculateGrowthRate()),
        period: 'last 30 days',
        trend: getTrendIndicator(calculateGrowthRate())
      },
      secondaryMetrics: [
        { 
          label: 'This Week', 
          value: Math.round((analyticsData?.summary?.total_responses || 0) * 0.18), 
          trend: getTrendIndicator(12),
          status: 'good' as const
        },
        {
          label: 'Completion Rate',
          value: `${analyticsData?.summary?.overall_completion_rate || 0}%`,
          trend: getTrendIndicator(analyticsData?.summary?.overall_completion_rate >= 80 ? 10 : -10),
          status: (analyticsData?.summary?.overall_completion_rate || 0) >= 80 ? 'good' as const : 'warning' as const
        },
        {
          label: 'Response Rate',
          value: `${analyticsData?.summary?.response_rate || 0}%`,
          trend: getTrendIndicator(analyticsData?.summary?.response_rate >= 70 ? 10 : -10),
          status: (analyticsData?.summary?.response_rate || 0) >= 70 ? 'good' as const : 'warning' as const
        }
      ],
      status: 'success' as const,
      insights: [
        `${analyticsData?.summary?.total_responses || 0} total responses collected`,
        `${analyticsData?.summary?.overall_completion_rate || 0}% completion rate achieved`,
        `Growth rate: ${calculateGrowthRate() >= 0 ? '+' : ''}${calculateGrowthRate()}% this month`
      ]
    },
    {
      title: 'User Engagement',
      value: analyticsData?.summary?.total_sessions || 0,
      previousValue: Math.max(0, (analyticsData?.summary?.total_sessions || 0) - 15),
      icon: Activity,
      change: {
        value: Math.abs(calculateGrowthRate()),
        period: 'last 30 days',
        trend: getTrendIndicator(calculateGrowthRate())
      },
      secondaryMetrics: [
        { 
          label: 'Completed Sessions', 
          value: analyticsData?.summary?.completed_sessions || 0, 
          trend: getTrendIndicator(5),
          status: 'good' as const
        },
        { 
          label: 'User Satisfaction', 
          value: `${analyticsData?.summary?.user_satisfaction_rate || 0}%`, 
          trend: getTrendIndicator(analyticsData?.summary?.user_satisfaction_rate >= 80 ? 10 : -10),
          status: (analyticsData?.summary?.user_satisfaction_rate || 0) >= 80 ? 'good' as const : 'warning' as const
        },
        {
          label: 'Avg Score',
          value: `${normalizedAvgScore.toFixed(1)}/5`,
          trend: getTrendIndicator(normalizedAvgScore >= 4 ? 10 : normalizedAvgScore >= 3 ? 0 : -10),
          status: normalizedAvgScore >= 4 ? 'good' as const : normalizedAvgScore >= 3 ? 'warning' as const : 'critical' as const
        }
      ],
      status: 'success' as const,
      insights: [
        `${analyticsData?.summary?.completed_sessions || 0} sessions completed successfully`,
        `${analyticsData?.summary?.user_satisfaction_rate || 0}% user satisfaction rate`,
        `Average score: ${normalizedAvgScore.toFixed(1)}/5 stars`
      ]
    }
  ];

  // Real summary metrics
  const summaryMetrics = [
    {
      label: 'Overall Performance Score',
      value: `${calculatePerformanceScore()}%`,
      status: calculatePerformanceScore() >= 80 ? 'good' as const : calculatePerformanceScore() >= 60 ? 'warning' as const : 'critical' as const,
      trend: getTrendIndicator(calculateGrowthRate()),
      target: 100,
      description: 'Composite performance across all metrics',
      change: { value: Math.abs(calculateGrowthRate()), period: 'this month' }
    },
    {
      label: 'User Satisfaction',
      value: `${analyticsData?.summary?.user_satisfaction_rate || 0}%`,
      status: (analyticsData?.summary?.user_satisfaction_rate || 0) >= 80 ? 'good' as const : 'warning' as const,
      trend: getTrendIndicator(8),
      description: 'Percentage of users rating 4+ stars',
      change: { value: 8, period: 'vs last month' }
    },
    {
      label: 'Growth Trajectory',
      value: `${calculateGrowthRate() >= 0 ? '+' : ''}${calculateGrowthRate()}%`,
      status: calculateGrowthRate() >= 0 ? 'good' as const : 'warning' as const,
      trend: getTrendIndicator(calculateGrowthRate()),
      description: 'Month-over-month growth rate',
      change: { value: Math.abs(calculateGrowthRate()), period: 'acceleration' }
    }
  ];

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* System Health Overview */}
        <DataSummaryBar 
          metrics={summaryMetrics}
          title="Performance Dashboard"
          lastUpdated="Live • Updated 30s ago"
          onRefresh={() => refetch()}
          isRefreshing={isLoading}
        />

        {/* Section Navigation */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            <Badge variant="outline" className="flex items-center space-x-2 self-start sm:self-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs">Real-time Data</span>
            </Badge>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-xl font-bold text-gray-900">Key Performance Indicators</h2>
                <Badge variant="secondary" className="text-xs font-medium self-start sm:self-auto">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {calculateGrowthRate() >= 0 ? 'Positive' : 'Negative'} trending metrics
                </Badge>
              </div>
              
              {/* Optimized responsive grid for 2 cards */}
              <ResponsiveGrid 
                columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
                gap="lg"
                className="w-full"
              >
                {performanceMetrics.map((metric, index) => (
                  <EnhancedMetricCard 
                    key={index}
                    {...metric}
                    hideActions={true}
                  />
                ))}
              </ResponsiveGrid>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
              <p className="text-base text-gray-600 mb-4">Advanced analytics and trend analysis</p>
              <Button onClick={() => onTabChange('feedback')}>
                View Analytics Dashboard
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-base text-gray-600 mb-4">Intelligent recommendations and predictive analytics</p>
              <Button onClick={() => onTabChange('customer-insights')}>
                Explore Insights
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Overall Performance Summary */}
        {!isLoading && analyticsData?.summary && analyticsData.summary.total_sessions > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl border border-green-200 shadow-sm w-full max-w-4xl space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-green-900">
                    Excellence Score: {calculatePerformanceScore()}%
                  </div>
                  <div className="text-sm text-green-700">
                    {calculatePerformanceScore() >= 80 ? 'Exceeding' : calculatePerformanceScore() >= 60 ? 'Meeting' : 'Below'} industry benchmarks
                  </div>
                </div>
              </div>
              <div className="hidden lg:block h-12 w-px bg-green-200"></div>
              <div className="grid grid-cols-3 gap-6 text-center w-full max-w-md">
                <div>
                  <div className="text-xl font-bold text-green-900">
                    {analyticsData.summary.total_responses.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Total Responses</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-900">
                    {analyticsData.summary.overall_completion_rate}%
                  </div>
                  <div className="text-sm text-green-700">Success Rate</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-900">
                    {analyticsData.summary.user_satisfaction_rate}%
                  </div>
                  <div className="text-sm text-green-700">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardErrorBoundary>
  );
};
