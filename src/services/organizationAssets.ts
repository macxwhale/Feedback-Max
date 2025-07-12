
import { supabase } from '@/integrations/supabase/client';
import type { OrganizationAsset, OrganizationTheme } from './organizationService.types';

export const getOrganizationAssets = async (organizationId: string): Promise<OrganizationAsset[]> => {
  try {
    const { data, error } = await supabase
      .from('organization_assets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('display_order')
      .order('created_at');

    if (error) {
      console.error('Error fetching organization assets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching organization assets:', error);
    return [];
  }
};

export const getOrganizationTheme = async (organizationId: string): Promise<OrganizationTheme | null> => {
  try {
    const { data, error } = await supabase
      .from('organization_themes')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching organization theme:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching organization theme:', error);
    return null;
  }
};

export const getOrganizationConfig = async (slug: string) => {
  try {
    const { data, error } = await supabase.rpc('get_organization_config', {
      org_slug: slug
    });

    if (error) {
      console.error('Error fetching organization config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching organization config:', error);
    return null;
  }
};
