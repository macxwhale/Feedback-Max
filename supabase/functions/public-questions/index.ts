
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function createErrorResponse(message: string, status: number = 400) {
  console.error('API Error:', message);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

serve(async (req) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let organizationSlug: string | null = null;

    // Support both GET (for direct testing) and POST (from client)
    if (req.method === 'POST') {
      const body = await req.json();
      organizationSlug = body.organizationSlug;
    } else {
      const url = new URL(req.url);
      organizationSlug = url.searchParams.get('organizationSlug');
    }

    if (!organizationSlug) {
      return createErrorResponse('organizationSlug is required', 400);
    }
    
    // Use service role key for admin-level access to read organizations and questions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get organization ID from slug
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationSlug)
      .eq('is_active', true)
      .single();

    if (orgError || !orgData) {
      console.error('Error fetching organization by slug:', orgError);
      return createErrorResponse('Organization not found', 404);
    }

    const organizationId = orgData.id;

    // Fetch questions for the organization
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_options(*),
        question_scale_config(*)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('order_index');
    
    if (error) {
      console.error('Database error fetching questions:', error);
      return createErrorResponse('Failed to fetch questions', 500);
    }

    console.log(`Fetched ${data?.length || 0} questions for org ${organizationId}`);
    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in public-questions function:', error);
    return createErrorResponse('Internal server error', 500);
  }
});
