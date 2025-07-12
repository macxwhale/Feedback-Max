
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationStats {
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
}

export const useOrganizationStats = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization-stats', organizationId],
    queryFn: async (): Promise<OrganizationStats> => {
      const { data, error } = await supabase.rpc('get_organization_stats', {
        org_id: organizationId
      });

      if (error) throw error;
      
      // Type assertion since we know the structure from our RPC function
      return data as unknown as OrganizationStats;
    },
    enabled: !!organizationId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};
