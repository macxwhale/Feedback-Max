import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function logRequest(supabase: any, apiKeyId: string, organizationId: string, endpoint: string, statusCode: number, ipAddress: string) {
  await supabase.from('api_request_logs').insert({
    api_key_id: apiKeyId,
    organization_id: organizationId,
    endpoint: endpoint,
    status_code: statusCode,
    ip_address: ipAddress,
  });
}

function createErrorResponse(message: string, status = 400) {
  console.error('API Error:', message);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

serve(async (req) => {
  const requestUrl = new URL(req.url);
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || '';

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('Missing or invalid Authorization header', 401);
  }
  const apiKey = authHeader.replace('Bearer ', '');

  const keyParts = apiKey.split('_');
  const prefix = keyParts.slice(0, -1).join('_');
  const secretLength = keyParts.length > 1 ? keyParts[keyParts.length - 1].length : 0;
  console.log(`[api-questions] Received API key for validation. Prefix: ${prefix}, Secret length: ${secretLength}`);

  const { data: validationData, error: validationError } = await supabase.rpc('validate_api_key', {
    p_api_key: apiKey
  }).single();
  
  if (validationError || !validationData || !validationData.is_valid) {
    console.error('API key validation failed:', validationError);
    return createErrorResponse('Invalid API Key', 401);
  }

  const { org_id: organizationId, key_id: apiKeyId } = validationData;

  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        is_required,
        category,
        question_options(option_text),
        question_scale_config(min_value, max_value, min_label, max_label)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('order_index');
    
    if (error) {
      await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 500, ipAddress);
      console.error('Database error fetching questions:', error);
      return createErrorResponse('Failed to fetch questions', 500);
    }
    
    const transformedData = data.map((q: any) => ({
      id: q.id,
      type: q.question_type,
      question: q.question_text,
      required: q.is_required || false,
      category: q.category,
      options: q.question_options?.map((opt: any) => opt.option_text) || [],
      scale: q.question_scale_config?.[0] ? {
        min: q.question_scale_config[0].min_value,
        max: q.question_scale_config[0].max_value,
        minLabel: q.question_scale_config[0].min_label,
        maxLabel: q.question_scale_config[0].max_label
      } : undefined
    }));

    await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 200, ipAddress);
    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 500, ipAddress);
    console.error('Unexpected error in api-questions function:', error);
    return createErrorResponse('Internal server error', 500);
  }
});
