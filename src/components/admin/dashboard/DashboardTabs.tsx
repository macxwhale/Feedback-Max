
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { EnhancedUserManagement } from '../EnhancedUserManagement';
import { OrganizationSpecificStats } from '../OrganizationSpecificStats';
import { OrganizationSettingsTab } from '../OrganizationSettingsTab';
import { QuestionsManagement } from '../QuestionsManagement';
import { AdvancedDashboardView } from './AdvancedDashboardView';
import { CustomerInsightsDashboard } from './CustomerInsightsDashboard';
import { SentimentAnalyticsDashboard } from './SentimentAnalyticsDashboard';

const MembersTab = React.lazy(() => import('@/components/org-admin/dashboard/MembersTab'));
const InboxTab = React.lazy(() => import('@/components/admin/dashboard/tabs/InboxTab'));

export type DashboardModuleKey =
  | 'overview'
  | 'customer-insights'
  | 'sentiment'
  | 'members'
  | 'feedback'
  | 'inbox'
  | 'questions'
  | 'settings'
  | 'integrations';

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  organization: any;
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

// Use React.lazy for all tab content components
const AdvancedDashboardTab = React.lazy(() => import('./tabs/AdvancedDashboardTab'));
const CustomerInsightsTab = React.lazy(() => import('./tabs/CustomerInsightsTab'));
const SentimentTab = React.lazy(() => import('./tabs/SentimentTab'));
const FeedbackTab = React.lazy(() => import('./tabs/FeedbackTab'));
const IntegrationsTab = React.lazy(() => import('./tabs/IntegrationsTab'));
const QuestionsTab = React.lazy(() => import('./tabs/QuestionsTab'));
const SettingsTab = React.lazy(() => import('./tabs/SettingsTab'));

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  organization,
  stats,
  isLiveActivity,
  setIsLiveActivity,
  handleQuickActions
}) => {
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsContent value="overview" className="space-y-6">
          <React.Suspense fallback={<div>Loading advanced dashboard…</div>}>
            <AdvancedDashboardTab
              organization={organization}
              stats={stats}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isLiveActivity={isLiveActivity}
              setIsLiveActivity={setIsLiveActivity}
              handleQuickActions={handleQuickActions}
            />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="customer-insights">
          <React.Suspense fallback={<div>Loading customer insights…</div>}>
            <CustomerInsightsTab organizationId={organization.id} />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="sentiment">
          <React.Suspense fallback={<div>Loading sentiment…</div>}>
            <SentimentTab organizationId={organization.id} />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="members">
          <React.Suspense fallback={<div>Loading members…</div>}>
            <MembersTab organization={organization} />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="feedback">
          <React.Suspense fallback={<div>Loading feedback…</div>}>
            <FeedbackTab organizationId={organization.id} />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="inbox">
          <React.Suspense fallback={<div>Loading inbox…</div>}>
            <InboxTab organizationId={organization.id} />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="questions">
          <React.Suspense fallback={<div>Loading questions…</div>}>
            <QuestionsTab />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="settings">
          <React.Suspense fallback={<div>Loading settings…</div>}>
            <SettingsTab organization={organization} />
          </React.Suspense>
        </TabsContent>
        <TabsContent value="integrations">
          <React.Suspense fallback={<div>Loading integrations…</div>}>
            <IntegrationsTab />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
