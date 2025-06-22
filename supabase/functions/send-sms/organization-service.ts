
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Organization } from './types.ts';

export async function getOrganizationSmsSettings(
  supabase: SupabaseClient,
  organizationId: string
): Promise<Organization> {
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('sms_settings, sms_sender_id, name')
    .eq('id', organizationId)
    .single();

  if (orgError || !organization) {
    console.error(`[BULK-SMS] Organization not found:`, orgError);
    throw new Error('Organization not found or SMS not configured');
  }

  if (!organization.sms_settings?.username || !organization.sms_settings?.apiKey) {
    console.error(`[BULK-SMS] SMS credentials not configured for org ${organizationId}`);
    throw new Error('SMS credentials not configured');
  }

  return organization;
}
