
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedOrganizationStats {
  total_questions: number;
  total_responses: number;
  total_sessions: number;
  completed_sessions: number;
  active_members: number;
  avg_session_score: number;
  recent_activity: Array<{
    type: string;
    created_at: string;
    status: string;
  }>;
  growth_metrics: {
    sessions_this_month: number;
    sessions_last_month: number;
    growth_rate: number | null;
  };
}

export const useEnhancedOrganizationStats = (organizationId: string) => {
  return useQuery({
    queryKey: ['enhanced-organization-stats', organizationId],
    queryFn: async (): Promise<EnhancedOrganizationStats> => {
      const { data, error } = await supabase.rpc('get_organization_stats_enhanced', {
        org_id: organizationId
      });

      if (error) throw error;
      
      // Properly cast the Json response to our interface
      return data as unknown as EnhancedOrganizationStats;
    },
    enabled: !!organizationId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
