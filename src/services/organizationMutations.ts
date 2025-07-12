
import { supabase } from '@/integrations/supabase/client';
import type { Organization, CreateOrganizationData } from './organizationService.types';

export const createOrganization = async (orgData: CreateOrganizationData): Promise<Organization | null> => {
  try {
    // Get current user ID for created_by_user_id
    const { data: { user } } = await supabase.auth.getUser();

    // Accept plan_type only as supported enum, fallback to 'starter'
    let safePlanType: 'starter' | 'pro' | 'enterprise' = 'starter';
    if (orgData.plan_type === 'pro' || orgData.plan_type === 'enterprise') {
      safePlanType = orgData.plan_type;
    }

    const organizationToCreate = {
      ...orgData,
      created_by_user_id: user?.id || orgData.created_by_user_id,
      is_active: true,
      primary_color: orgData.primary_color || '#007ACE',
      secondary_color: orgData.secondary_color || '#073763',
      plan_type: safePlanType,
      max_responses: orgData.max_responses || 100,
      features_config: orgData.features_config || null,
      trial_ends_at: orgData.trial_ends_at || null,
    };

    const { data, error } = await supabase
      .from('organizations')
      .insert(organizationToCreate)
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      return null;
    }

    // Log in organization_audit_log (if table exists and user authenticated, best effort)
    if (data?.id && user?.id) {
      await supabase
        .from('organization_audit_log')
        .insert({
          organization_id: data.id,
          action: "create_organization",
          performed_by: user.id,
          new_value: data,
        });
    }

    return data;
  } catch (error) {
    console.error('Error creating organization:', error);
    return null;
  }
};

export const updateOrganization = async (id: string, updates: Partial<Organization>): Promise<Organization | null> => {
  try {
    // Fix: Explicitly type and filter plan_type BEFORE assign
    const { plan_type: unsafePlanType, ...rest } = updates;
    let safeUpdates: Partial<Omit<Organization, 'plan_type'>> & { plan_type?: 'starter' | 'pro' | 'enterprise' } = { ...rest };

    if (unsafePlanType !== undefined) {
      if (unsafePlanType === 'starter' || unsafePlanType === 'pro' || unsafePlanType === 'enterprise') {
        safeUpdates.plan_type = unsafePlanType;
      } else {
        safeUpdates.plan_type = 'starter';
      }
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error updating organization:', error);
    return null;
  }
};
