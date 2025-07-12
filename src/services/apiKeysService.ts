
import { supabase } from '@/integrations/supabase/client';
import type { ApiKey } from '@/types/apiKey';

export const getApiKeys = async (organizationId: string): Promise<ApiKey[]> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_name, key_prefix, status, last_used_at, expires_at, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as ApiKey[];
};

export const createApiKey = async (organizationId: string, keyName: string): Promise<string> => {
    const { data, error } = await supabase.rpc('create_api_key', {
        p_organization_id: organizationId,
        p_key_name: keyName
    });

    if (error) throw error;
    return data;
};

export const updateApiKeyStatus = async (keyId: string, status: 'active' | 'inactive'): Promise<ApiKey> => {
    const { data, error } = await supabase
        .from('api_keys')
        .update({ status })
        .eq('id', keyId)
        .select()
        .single();
    
    if (error) throw error;
    return data as ApiKey;
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
    
    if (error) throw error;
};
