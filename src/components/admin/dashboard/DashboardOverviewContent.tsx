
import React from 'react';
import { H1, Body } from '@/components/ui/typography';
import { Zap } from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { useDashboardData } from './DashboardDataProvider';

interface DashboardOverviewContentProps {
  onTabChange: (tab: string) => void;
}

export const DashboardOverviewContent: React.FC<DashboardOverviewContentProps> = ({ onTabChange }) => {
  const { organization } = useDashboardData();

  return (
    <div className="space-y-8">
      {/* Clean Header Section - Removed all badges and buttons */}
      <div className="flex items-center justify-between">
        <div>
          <H1 className="mb-2 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span>Analytics Dashboard</span>
          </H1>
          <Body className="text-gray-600">
            Comprehensive insights and performance metrics for <span className="font-semibold text-orange-600">{organization?.name}</span>
          </Body>
        </div>
      </div>
      
      {/* Dashboard Overview - Cards will be filtered in DashboardOverview */}
      <DashboardOverview 
        organizationId={organization?.id || ''} 
        onTabChange={onTabChange} 
      />
    </div>
  );
};
