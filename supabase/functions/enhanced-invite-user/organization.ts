
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Organization } from './types.ts';

export const getOrganization = async (
  supabaseAdmin: SupabaseClient,
  organizationId: string
): Promise<{ organization?: Organization; error?: string }> => {
  const { data: organization, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('id, name, slug')
    .eq('id', organizationId)
    .single();

  if (orgError || !organization) {
    console.error('Organization not found:', orgError);
    return { error: 'Organization not found' };
  }

  return { organization };
};
