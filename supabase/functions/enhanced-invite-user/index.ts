
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getBaseUrl = (req: Request): string => {
  // Get the origin from the request headers
  const origin = req.headers.get('origin');
  if (origin) {
    return origin;
  }
  
  // Fallback to referer if origin is not available
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      // If referer is malformed, continue to fallback
    }
  }
  
  // Final fallback to a default URL (this should be configured for production)
  return 'https://pulsify.co.ke';
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, organizationId, role, enhancedRole } = await req.json();
    console.log('Processing enhanced invite for:', email, 'to organization:', organizationId);

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
    const { data: { user } }= await supabaseClient.auth.getUser();
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

    // Check if user already exists in Supabase Auth
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.find(u => u.email === email);

    if (userExists) {
      // Check if user is already in organization
      const { data: existingOrgUser } = await supabaseAdmin
        .from('organization_users')
        .select('user_id')
        .eq('user_id', userExists.id)
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

      // Add existing user directly to organization
      const { error: addError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: userExists.id,
          organization_id: organizationId,
          email: email,
          role: role,
          enhanced_role: enhancedRole || role,
          status: 'active',
          invited_by_user_id: user.id,
          accepted_at: new Date().toISOString()
        });

      if (addError) {
        console.error('Error adding existing user to organization:', addError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to add user to organization: ' + addError.message,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Existing user added to organization successfully');
      return new Response(JSON.stringify({
        success: true,
        message: 'User added to organization successfully.',
        type: 'direct_add',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // User doesn't exist - send invitation
    const baseUrl = getBaseUrl(req);
    const redirectUrl = `${baseUrl}/auth-callback?org=${organization.slug}&invitation=true`;
    
    console.log('Using redirect URL:', redirectUrl);

    // Use Supabase's built-in invitation system with organization context
    const { data: inviteResponse, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        inviter_email: user.email || 'Admin',
        invitation_type: 'organization_invite'
      }
    });

    if (inviteError) {
      console.error('Failed to send invitation email:', inviteError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send invitation email: ' + inviteError.message,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Invitation email sent successfully via Supabase');

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully. The user will receive an email to join the organization.',
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
