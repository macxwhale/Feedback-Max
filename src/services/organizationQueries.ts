
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

export const getAllOrganizations = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
};

export const getOrganizationBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching organization by slug:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return null;
  }
};

export const getOrganizationByDomain = async (domain: string) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('domain', domain)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching organization by domain:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching organization by domain:', error);
    return null;
  }
};
