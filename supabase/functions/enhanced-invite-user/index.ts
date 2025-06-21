
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

    // Check if there's an existing user with this email
    const { data: existingUserData, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listUsersError) {
      console.error('Error listing users:', listUsersError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to check existing users',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    const existingUser = existingUserData?.users?.find(u => u.email === email);
    
    // Create proper redirect URL for the organization dashboard
    const baseUrl = req.headers.get('origin') || 'https://pulsify.co.ke';
    const redirectUrl = `${baseUrl}/admin/${organization.slug}`;
    
    console.log('Using redirect URL:', redirectUrl);

    if (existingUser) {
      console.log('Existing user found, sending invitation...');
      
      // For existing users, use inviteUserByEmail which will send a reset password email
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectUrl,
        data: {
          organization_name: organization.name,
          organization_slug: organization.slug,
          organization_id: organizationId,
          role: role,
          enhanced_role: enhancedRole || role,
          inviter_email: user.email || 'Admin'
        }
      });

      if (inviteError) {
        console.error('Failed to send invitation to existing user:', inviteError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to send invitation email: ' + inviteError.message,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      // Add existing user to organization
      const { error: insertError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: existingUser.id,
          organization_id: organizationId,
          email: email,
          role: role,
          enhanced_role: enhancedRole || role,
          invited_by_user_id: user.id,
          accepted_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error adding existing user to organization:', insertError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Email sent but failed to add user to organization. Please try again.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Existing user added to organization successfully');
      return new Response(JSON.stringify({
        success: true,
        message: 'User added to organization and invitation email sent',
        type: 'existing_user_invited',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('New user invitation - sending invite...');

    // For new users, use inviteUserByEmail which will create the user and send setup email
    const { data: newUserInvite, error: newUserInviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        inviter_email: user.email || 'Admin'
      }
    });

    if (newUserInviteError) {
      console.error('Failed to send invitation to new user:', newUserInviteError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send invitation email: ' + newUserInviteError.message,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Create invitation record for tracking
    const { error: invitationError } = await supabaseAdmin
      .from('user_invitations')
      .insert({
        email: email,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        invited_by_user_id: user.id,
        status: 'pending'
      });

    if (invitationError) {
      console.error('Invitation record error:', invitationError);
      // This is non-critical, so we don't fail the whole operation
    }

    console.log('New user invitation sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully. The user will receive an email to set their password and join the organization.',
      type: 'new_user_invited',
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
