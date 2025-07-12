
import { type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function logRequest(supabase: SupabaseClient, apiKeyId: string, organizationId: string, endpoint: string, statusCode: number, ipAddress: string) {
  await supabase.from('api_request_logs').insert({
    api_key_id: apiKeyId,
    organization_id: organizationId,
    endpoint: endpoint,
    status_code: statusCode,
    ip_address: ipAddress,
  });
}

export async function validateApiKey(supabase: SupabaseClient, apiKey: string) {
    const keyParts = apiKey.split('_');
    const prefix = keyParts.slice(0, -1).join('_');
    const secretLength = keyParts.length > 1 ? keyParts[keyParts.length - 1].length : 0;
    console.log(`[api-feedback] Received API key for validation. Prefix: ${prefix}, Secret length: ${secretLength}`);

    const { data: validationData, error: validationError } = await supabase.rpc('validate_api_key', {
      p_api_key: apiKey
    }).single();
    
    if (validationError || !validationData || !validationData.is_valid) {
      console.error('API key validation failed:', validationError);
      return null;
    }
  
    return { organizationId: validationData.org_id, apiKeyId: validationData.key_id };
}
