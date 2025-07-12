
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { orgId, enabled, senderId, username, apiKey } = await req.json()

    if (!orgId) throw new Error("Organization ID is required.");

    // Check if the current user is an admin for the organization
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_current_user_org_admin', { org_id: orgId });
    if (rpcError || !isAdmin) {
      console.error('Authorization check failed:', rpcError);
      return new Response(JSON.stringify({ error: 'Unauthorized: You are not an admin of this organization.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch current settings to preserve API key if needed
    const { data: currentOrg, error: fetchError } = await supabase
      .from('organizations')
      .select('sms_settings')
      .eq('id', orgId)
      .single();

    if (fetchError) {
      console.error('Error fetching current organization settings:', fetchError);
      throw fetchError;
    }

    const existingSettings = currentOrg?.sms_settings || {};
    let finalApiKey = apiKey;

    // If the user sends an empty API key, use the existing one
    if (!apiKey && existingSettings.apiKey) {
      finalApiKey = existingSettings.apiKey;
    }
    
    const sms_settings = (username && finalApiKey) ? { username, apiKey: finalApiKey } : null;

    const { data, error } = await supabase
      .from('organizations')
      .update({
        sms_enabled: enabled,
        sms_sender_id: senderId,
        sms_settings: sms_settings,
      })
      .eq('id', orgId)
      .select('id, sms_enabled, sms_sender_id') // Return confirmation data
      .single()

    if (error) {
      console.error('Error updating organization settings:', error);
      throw error;
    }

    console.log(`Successfully updated SMS settings for organization ${orgId}`);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
