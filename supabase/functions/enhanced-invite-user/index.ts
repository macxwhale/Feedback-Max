
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const getBaseUrl = (req: Request): string => {
  const origin = req.headers.get('origin');
  if (origin) return origin;
  
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Continue to fallback
    }
  }
  
  return 'https://pulsify.co.ke';
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid authorization header');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid authentication token' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 401
      });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid request body' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    const { email, organizationId, role, enhancedRole } = body;
    console.log('Processing enhanced invite for:', email, 'to organization:', organizationId);

    // Validate input
    if (!email || !organizationId || !role) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: email, organizationId, and role are required' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Please provide a valid email address' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    // Check if user has permission to invite users
    const { data: orgUser, error: permissionError } = await supabaseClient
      .from('organization_users')
      .select('enhanced_role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (permissionError || !orgUser) {
      console.error('Permission check failed:', permissionError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'You are not a member of this organization' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 403
      });
    }

    // Check if user has sufficient permissions (manager, admin, or owner can invite)
    const allowedRoles = ['manager', 'admin', 'owner'];
    if (!allowedRoles.includes(orgUser.enhanced_role)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'You need manager-level access or higher to invite users' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 403
      });
    }

    // Create admin client for operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get organization details
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error('Organization not found:', orgError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Organization not found' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404
      });
    }

    console.log('Organization found:', organization.name);

    // Check if user already exists in Supabase Auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers.users.find(u => u.email === email.toLowerCase().trim());

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
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 400
        });
      }

      // Add existing user directly to organization with enhanced role
      const { error: addError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: userExists.id,
          organization_id: organizationId,
          email: email.toLowerCase().trim(),
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
          error: 'Failed to add user to organization. Please try again.',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500
        });
      }

      console.log('Existing user added to organization successfully');
      return new Response(JSON.stringify({
        success: true,
        message: 'User successfully added to organization.',
        type: 'direct_add',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200
      });
    }

    // User doesn't exist - check for existing invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from('user_invitations')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'An invitation is already pending for this email address'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    // Create invitation record with enhanced role
    const { error: inviteError } = await supabaseAdmin
      .from('user_invitations')
      .insert({
        email: email.toLowerCase().trim(),
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        invited_by_user_id: user.id,
        status: 'pending'
      });

    if (inviteError) {
      console.error('Failed to create invitation:', inviteError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create invitation. Please try again.',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    // Send invitation email using Supabase's built-in invitation system
    const baseUrl = getBaseUrl(req);
    const redirectUrl = `${baseUrl}/auth-callback?org=${organization.slug}&invitation=true`;
    
    console.log('Using redirect URL:', redirectUrl);

    const { data: inviteResponse, error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email.toLowerCase().trim(), {
      redirectTo: redirectUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        inviter_email: user.email || 'system',
        invitation_type: 'organization_invite'
      }
    });

    if (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Update invitation status to indicate email failed
      await supabaseAdmin
        .from('user_invitations')
        .update({ status: 'email_failed' })
        .eq('email', email.toLowerCase().trim())
        .eq('organization_id', organizationId);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send invitation email. Please check the email address and try again.',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    } else {
      console.log('Invitation email sent successfully via Supabase');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully! The user will receive an email to join the organization.',
      type: 'invitation_sent',
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200
    });

  } catch (error) {
    console.error('Error in enhanced-invite-user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An unexpected error occurred while sending the invitation. Please try again.' 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
});
