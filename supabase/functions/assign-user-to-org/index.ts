
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: isAdmin, error: isAdminError } = await supabaseClient.rpc('get_current_user_admin_status');
    if (isAdminError) throw isAdminError;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'You must be a system admin to perform this action.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id, organization_id, role } = await req.json();

    if (!user_id || !organization_id || !role) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: user_id, organization_id, role.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Check if user is already assigned to this organization
    const { data: existingMembership, error: checkError } = await supabaseAdmin
      .from('organization_users')
      .select('id')
      .eq('user_id', user_id)
      .eq('organization_id', organization_id)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    let membership;
    if (!existingMembership) {
      // Insert a new membership with enhanced role
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id,
          organization_id,
          email: null, // this should be filled by another sync or on invite-accept,
          role: role, // Keep legacy role for compatibility
          enhanced_role: role, // Use enhanced role system
          status: 'active',
          invited_by_user_id: user.id, // who assigned the user
          accepted_at: new Date().toISOString()
        })
        .select()
        .single();
      if (insertError) throw insertError;
      membership = inserted;
    } else {
      // Update existing membership's role and status to active
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('organization_users')
        .update({
          role: role, // Keep legacy role for compatibility
          enhanced_role: role, // Use enhanced role system
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMembership.id)
        .select()
        .single();
      if (updateError) throw updateError;
      membership = updated;
    }

    return new Response(JSON.stringify({ success: true, membership }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
