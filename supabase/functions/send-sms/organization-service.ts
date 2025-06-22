
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Organization } from './types.ts';

export async function getOrganizationSmsSettings(
  supabase: SupabaseClient,
  organizationId: string
): Promise<Organization> {
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('sms_settings, sms_sender_id')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    throw new Error('Organization not found or SMS not configured');
  }

  if (!org.sms_settings?.username || !org.sms_settings?.apiKey) {
    throw new Error('SMS credentials not configured');
  }

  return org;
}
