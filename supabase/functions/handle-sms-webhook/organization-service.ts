
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Organization } from './types.ts';

export async function findSmsEnabledOrganization(supabase: SupabaseClient): Promise<Organization | null> {
  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, sms_settings, sms_sender_id')
    .eq('sms_enabled', true)
    .single();

  if (error || !org) {
    console.error('No SMS-enabled organization found');
    return null;
  }

  return org;
}
