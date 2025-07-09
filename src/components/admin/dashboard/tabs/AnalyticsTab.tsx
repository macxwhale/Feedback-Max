
import React from 'react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

interface AnalyticsTabProps {
  organizationId: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ organizationId }) => {
  console.log('AnalyticsTab rendering with organizationId:', organizationId);
  
  if (!organizationId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No organization ID provided</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsDashboard organizationId={organizationId} />
    </div>
  );
};
