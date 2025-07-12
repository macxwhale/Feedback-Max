
import React, { Suspense } from 'react';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { DashboardDataProvider } from './DashboardDataProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Lazy load heavy components with error handling
const DashboardCharts = React.lazy(() => 
  import('./DashboardCharts').then(module => ({ default: module.DashboardCharts })).catch(err => {
    console.error('Failed to load DashboardCharts:', err);
    return { default: () => <div>Error loading charts</div> };
  })
);

const CustomerInsightsDashboard = React.lazy(() => 
  import('./CustomerInsightsDashboard').then(module => ({ default: module.CustomerInsightsDashboard })).catch(err => {
    console.error('Failed to load CustomerInsightsDashboard:', err);
    return { default: () => <div>Error loading insights</div> };
  })
);

interface OptimizedDashboardProps {
  organizationId: string;
  activeView?: 'overview' | 'charts' | 'insights';
}

export const OptimizedDashboard: React.FC<OptimizedDashboardProps> = ({
  organizationId,
  activeView = 'overview'
}) => {
  console.log('OptimizedDashboard rendering with:', { organizationId, activeView });

  const renderView = () => {
    try {
      switch (activeView) {
        case 'charts':
          return (
            <Suspense fallback={<EnhancedLoading variant="skeleton" text="Loading charts..." />}>
              <DashboardCharts />
            </Suspense>
          );
        case 'insights':
          return (
            <Suspense fallback={<EnhancedLoading variant="skeleton" text="Loading insights..." />}>
              <CustomerInsightsDashboard organizationId={organizationId} />
            </Suspense>
          );
        default:
          return (
            <div className="space-y-6">
              <Suspense fallback={<EnhancedLoading variant="skeleton" />}>
                <DashboardCharts />
              </Suspense>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering dashboard view:', error);
      return <div>Error loading dashboard content</div>;
    }
  };

  return (
    <ErrorBoundary
      title="Dashboard Loading Error"
      description="There was an error loading the dashboard components."
    >
      <DashboardDataProvider>
        <ResponsiveContainer
          maxWidth="full"
          padding="lg"
          className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100"
        >
          {renderView()}
        </ResponsiveContainer>
      </DashboardDataProvider>
    </ErrorBoundary>
  );
};
