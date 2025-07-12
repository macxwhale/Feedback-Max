
import React from 'react';
import { DashboardOverview } from './DashboardOverview';
import { AnalyticsTable } from './AnalyticsTable';
import { AnalyticsInsights } from './AnalyticsInsights';
import { RealTimeAnalytics } from './RealTimeAnalytics';
import { RefactoredExecutiveDashboard } from './RefactoredExecutiveDashboard';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { TrendDataPoint } from '@/types/analytics';
import { useEnhancedOrganizationStats } from '@/hooks/useEnhancedOrganizationStats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// New component for trend analysis
const TrendAnalysisChart: React.FC<{ data: TrendDataPoint[]; isLoading: boolean }> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-1/3 rounded bg-gray-200 animate-pulse mb-2"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 rounded bg-gray-200 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>Key metrics over the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center text-center text-gray-500">
            <LineChartIcon className="w-12 h-12 mb-4" />
            <p className="font-semibold">No Trend Data Available</p>
            <p className="text-sm">Try selecting a different date range to see trend analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
        <CardDescription>Key metrics over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completion_rate"
                name="Completion Rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="avg_score"
                name="Average Score"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};


// MAIN: No Tabs, only pure content switching!
interface AdvancedDashboardViewProps {
  organizationId: string;
  organizationName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats?: any;
  isLiveActivity: boolean;
  setIsLiveActivity: (isLive: boolean) => void;
  handleQuickActions: {
    onCreateQuestion: () => void;
    onInviteUser: () => void;
    onExportData: () => void;
    onViewSettings: () => void;
  };
}

export const AdvancedDashboardView: React.FC<AdvancedDashboardViewProps> = ({
  organizationId,
  organizationName,
  activeTab,
  stats,
  isLiveActivity,
  setIsLiveActivity,
  handleQuickActions,
}) => {
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsTableData(organizationId);
  const { data: enhancedStats, isLoading: enhancedLoading, error: enhancedError } = useEnhancedOrganizationStats(organizationId);

  // Show loading state only if both are loading
  if (analyticsLoading && enhancedLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Create enhanced summary with fallback values
  const createEnhancedSummary = () => {
    const baseSummary = analyticsData?.summary || {
      total_questions: 0,
      total_responses: 0,
      overall_completion_rate: 0
    };

    return {
      ...baseSummary,
      overall_avg_score: enhancedStats?.avg_session_score || 0
    };
  };

  const enhancedSummary = createEnhancedSummary();

  // Alerts
  const errorAlert = (analyticsError || enhancedError) ? (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Some dashboard data may be unavailable. {analyticsError?.message || enhancedError?.message}
      </AlertDescription>
    </Alert>
  ) : null;

  // Master switch: what content to show for each subview (from parent)
  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        {errorAlert}
        <DashboardOverview organizationId={organizationId} />
        <TrendAnalysisChart data={analyticsData?.trendData || []} isLoading={analyticsLoading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsTable
            questions={analyticsData?.questions || []}
            categories={analyticsData?.categories || []}
            summary={enhancedSummary}
          />
          <AnalyticsInsights
            stats={enhancedStats}
            isLoading={enhancedLoading}
          />
        </div>
      </div>
    );
  }
  if (activeTab === "executive") {
    return (
      <div className="space-y-6">
        {errorAlert}
        <RefactoredExecutiveDashboard organizationId={organizationId} />
      </div>
    );
  }
  if (activeTab === "realtime") {
    return (
      <div className="space-y-6">
        {errorAlert}
        <RealTimeAnalytics organizationId={organizationId} />
      </div>
    );
  }
  if (activeTab === "detailed") {
    return (
      <div className="space-y-6">
        {errorAlert}
        <AnalyticsTable
          questions={analyticsData?.questions || []}
          categories={analyticsData?.categories || []}
          summary={enhancedSummary}
          showDrillDown={true}
        />
      </div>
    );
  }

  // Default fallback: allow parent to handle
  return (
    <>
      {errorAlert}
      <DashboardOverview organizationId={organizationId} />
    </>
  );
};
