import { supabase } from '@/integrations/supabase/client';

export const getOrganizationStatsEnhanced = async (organizationId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_organization_stats_enhanced', {
      org_id: organizationId
    });

    if (error) {
      console.error('Error fetching organization stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching organization stats:', error);
    return null;
  }
};
