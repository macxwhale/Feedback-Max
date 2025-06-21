
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
    const { email, organizationId, role, enhancedRole } = await req.json();
    console.log('Processing invite for:', email, 'to organization:', organizationId);

    // Validate input
    if (!email || !organizationId || !role) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: email, organizationId, and role are required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create regular client for permission checks
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get current user and verify permissions
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    console.log('Current user ID:', user.id);

    // Check if current user is org admin
    const { data: orgUser } = await supabaseAdmin
      .from('organization_users')
      .select('role, enhanced_role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    console.log('Current user org role:', orgUser);

    if (!orgUser || (orgUser.role !== 'admin' && orgUser.enhanced_role !== 'admin' && orgUser.enhanced_role !== 'owner')) {
      console.log('User lacks admin permissions');
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    // Get organization details
    const { data: organization } = await supabaseAdmin
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single();

    if (!organization) {
      console.log('Organization not found');
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log('Organization found:', organization.name);

    // Check if user already exists in organization
    const { data: existingOrgUser } = await supabaseAdmin
      .from('organization_users')
      .select('user_id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existingOrgUser) {
      console.log('User is already a member of this organization');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User is already a member of this organization' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from('user_invitations')
      .select('id, status')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      console.log('Invitation already exists for this email');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'An invitation is already pending for this email' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Create proper redirect URL for the organization dashboard
    const baseUrl = req.headers.get('origin') || 'https://pulsify.co.ke';
    const redirectUrl = `${baseUrl}/auth-callback?org=${organization.slug}`;
    
    console.log('Using redirect URL:', redirectUrl);

    // Always create invitation record first - this is the source of truth
    const { data: invitationData, error: invitationError } = await supabaseAdmin
      .from('user_invitations')
      .insert({
        email: email,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        invited_by_user_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Failed to create invitation record:', invitationError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create invitation record: ' + invitationError.message,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Invitation record created:', invitationData.id);

    // Send invitation email with organization context in metadata
    const { data: inviteResponse, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        invitation_id: invitationData.id,
        inviter_email: user.email || 'Admin'
      }
    });

    if (inviteError) {
      console.error('Failed to send invitation email:', inviteError);
      
      // Clean up the invitation record since email sending failed
      await supabaseAdmin
        .from('user_invitations')
        .delete()
        .eq('id', invitationData.id);

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send invitation email: ' + inviteError.message,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Invitation email sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully. The user will receive an email to join the organization.',
      invitation_id: invitationData.id,
      type: 'invitation_sent',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in enhanced-invite-user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An error occurred while inviting the user' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
