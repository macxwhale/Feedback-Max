
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user details
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user) {
      throw new Error('User not found');
    }

    // Since we're creating users directly in the organization, 
    // we don't need to process invitation metadata anymore
    // The user should already be in organization_users table

    // Check if user is already in an organization
    const { data: orgUser } = await supabaseAdmin
      .from('organization_users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgUser) {
      // User is already set up, just return success
      return new Response(JSON.stringify({ 
        success: true, 
        organization_id: orgUser.organization_id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If user is not in any organization yet, this might be an old invitation flow
    // Check if user has organization metadata from old invitation system
    const orgId = user.user_metadata?.organization_id;
    const role = user.user_metadata?.role;
    const enhancedRole = user.user_metadata?.enhanced_role;
    const invitedBy = user.user_metadata?.invited_by;

    if (orgId && role) {
      // Handle legacy invitation flow
      const { error: orgError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: user.id,
          organization_id: orgId,
          email: user.email,
          role: role,
          enhanced_role: enhancedRole || role,
          invited_by_user_id: invitedBy,
          accepted_at: new Date().toISOString()
        });

      if (orgError && !orgError.message.includes('duplicate')) {
        console.error('Error adding user to organization:', orgError);
      }

      // Update invitation status if exists
      const { error: inviteError } = await supabaseAdmin
        .from('user_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email)
        .eq('organization_id', orgId);

      if (inviteError) {
        console.error('Error updating invitation status:', inviteError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in auth-callback-handler:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
