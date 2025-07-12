
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedDashboardLayout } from './dashboard/EnhancedDashboardLayout';
import { FloatingActionButton, ScrollToTopFAB } from '@/components/ui/floating-action-button';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Data Provider
import { DashboardDataProvider, useDashboardData } from './dashboard/DashboardDataProvider';

// Lazy load tab components for better performance with error handling
const DashboardOverviewContent = React.lazy(() => 
  import('./dashboard/DashboardOverviewContent').then(module => ({ default: module.DashboardOverviewContent })).catch(err => {
    console.error('Failed to load DashboardOverviewContent:', err);
    return { default: () => <div className="p-4">Error loading overview content</div> };
  })
);

const MembersTab = React.lazy(() => 
  import('./dashboard/tabs/MembersTab').then(module => ({ default: module.default })).catch(err => {
    console.error('Failed to load MembersTab:', err);
    return { default: () => <div className="p-4">Error loading members tab</div> };
  })
);

const FeedbackTab = React.lazy(() => 
  import('./dashboard/tabs/FeedbackTab').then(module => ({ default: module.FeedbackTab })).catch(err => {
    console.error('Failed to load FeedbackTab:', err);
    return { default: () => <div className="p-4">Error loading feedback tab</div> };
  })
);

const QuestionsTab = React.lazy(() => 
  import('./dashboard/tabs/QuestionsTab').then(module => ({ default: module.QuestionsTab })).catch(err => {
    console.error('Failed to load QuestionsTab:', err);
    return { default: () => <div className="p-4">Error loading questions tab</div> };
  })
);

const SettingsTab = React.lazy(() => 
  import('./dashboard/tabs/SettingsTab').then(module => ({ default: module.SettingsTab })).catch(err => {
    console.error('Failed to load SettingsTab:', err);
    return { default: () => <div className="p-4">Error loading settings tab</div> };
  })
);

const IntegrationsTab = React.lazy(() => 
  import('./dashboard/tabs/IntegrationsTab').then(module => ({ default: module.IntegrationsTab })).catch(err => {
    console.error('Failed to load IntegrationsTab:', err);
    return { default: () => <div className="p-4">Error loading integrations tab</div> };
  })
);

const SentimentTab = React.lazy(() => 
  import('./dashboard/tabs/SentimentTab').then(module => ({ default: module.SentimentTab })).catch(err => {
    console.error('Failed to load SentimentTab:', err);
    return { default: () => <div className="p-4">Error loading sentiment tab</div> };
  })
);

const PerformanceTab = React.lazy(() => 
  import('./dashboard/tabs/PerformanceTab').then(module => ({ default: module.PerformanceTab })).catch(err => {
    console.error('Failed to load PerformanceTab:', err);
    return { default: () => <div className="p-4">Error loading performance tab</div> };
  })
);

const CustomerInsightsTab = React.lazy(() => 
  import('./dashboard/tabs/CustomerInsightsTab').then(module => ({ default: module.CustomerInsightsTab })).catch(err => {
    console.error('Failed to load CustomerInsightsTab:', err);
    return { default: () => <div className="p-4">Error loading customer insights tab</div> };
  })
);

const DashboardContent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const { isMobile } = useResponsiveDesign();
  
  console.log('DashboardContent rendering with slug:', slug);

  // Performance optimization with error handling
  const { createDebouncedFunction } = usePerformanceOptimization({
    enableMemoryCleanup: true,
    debounceDelay: 250
  });

  // Debounce tab changes to prevent rapid switching
  const debouncedSetActiveTab = createDebouncedFunction(setActiveTab);

  let organization, stats, isLoading;
  
  try {
    const dashboardData = useDashboardData();
    organization = dashboardData.organization;
    stats = dashboardData.stats;
    isLoading = dashboardData.isLoading;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    organization = null;
    stats = null;
    isLoading = false;
  }

  const renderTabContent = () => {
    const tabProps = {
      organizationId: organization?.id || '',
      organization
    };

    try {
      switch (activeTab) {
        case 'members':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <MembersTab {...tabProps} />
            </React.Suspense>
          );
        case 'feedback':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <FeedbackTab organizationId={tabProps.organizationId} />
            </React.Suspense>
          );
        case 'questions':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <QuestionsTab />
            </React.Suspense>
          );
        case 'settings':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <SettingsTab {...tabProps} />
            </React.Suspense>
          );
        case 'integrations':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <IntegrationsTab />
            </React.Suspense>
          );
        case 'sentiment':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <SentimentTab organizationId={tabProps.organizationId} />
            </React.Suspense>
          );
        case 'performance':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <PerformanceTab organizationId={tabProps.organizationId} />
            </React.Suspense>
          );
        case 'customer-insights':
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <CustomerInsightsTab organizationId={tabProps.organizationId} />
            </React.Suspense>
          );
        default:
          return (
            <React.Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <DashboardOverviewContent onTabChange={debouncedSetActiveTab} />
            </React.Suspense>
          );
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return <div className="p-4">Error loading tab content</div>;
    }
  };

  if (!organization && !isLoading) {
    console.log('No organization found and not loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Organization Not Found</h2>
          <p className="text-gray-600">The requested organization could not be found.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-48"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      title="Dashboard Error"
      description="There was an error loading the dashboard. Please try refreshing the page."
    >
      <EnhancedDashboardLayout
        organizationName={organization?.name || 'Organization'}
        organizationId={organization?.id || ''}
        organizationSlug={slug || ''}
        activeTab={activeTab}
        onTabChange={debouncedSetActiveTab}
        stats={stats}
        isLoading={isLoading}
      >
        {renderTabContent()}
      </EnhancedDashboardLayout>
      
      {/* Floating Action Button for mobile quick actions */}
      {isMobile && activeTab === 'overview' && (
        <FloatingActionButton
          onClick={() => debouncedSetActiveTab('members')}
          extended
        >
          <Plus className="w-5 h-5" />
          Quick Action
        </FloatingActionButton>
      )}
      
      <ScrollToTopFAB />
    </ErrorBoundary>
  );
};

export const OrganizationAdminDashboard: React.FC = () => {
  console.log('OrganizationAdminDashboard component mounted');
  
  return (
    <ErrorBoundary
      title="Dashboard Error"
      description="There was an error initializing the dashboard."
    >
      <DashboardDataProvider>
        <DashboardContent />
      </DashboardDataProvider>
    </ErrorBoundary>
  );
};
