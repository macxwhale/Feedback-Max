
import React, { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrganization } from '@/context/OrganizationContext';
import { getOrganizationStatsEnhanced } from '@/services/organizationQueries';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { OrganizationStats } from '@/types/organizationStats';

interface DashboardContextValue {
  organization: any;
  stats: OrganizationStats | null;
  analyticsData: any;
  isLoading: boolean;
  error: Error | null;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboardData = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return context;
};

interface DashboardDataProviderProps {
  children: React.ReactNode;
}

export const DashboardDataProvider: React.FC<DashboardDataProviderProps> = ({ children }) => {
  console.log('DashboardDataProvider rendering');
  
  const { organization, loading: orgLoading } = useOrganization();
  console.log('Organization from context:', { organization, orgLoading });

  const { data: stats, isLoading: statsLoading, error } = useQuery({
    queryKey: ['organization-stats', organization?.id],
    queryFn: () => {
      console.log('Fetching stats for organization:', organization?.id);
      return getOrganizationStatsEnhanced(organization!.id);
    },
    enabled: !!organization?.id,
  });

  console.log('Stats query result:', { stats, statsLoading, error });

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData(organization?.id || '');

  const isLoading = orgLoading || statsLoading || analyticsLoading;
  const typedStats: OrganizationStats | null = stats ? (stats as unknown as OrganizationStats) : null;

  console.log('DashboardDataProvider state:', {
    organization: organization?.name,
    hasStats: !!typedStats,
    isLoading,
    error: error?.message
  });

  const value: DashboardContextValue = {
    organization,
    stats: typedStats,
    analyticsData,
    isLoading,
    error,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
