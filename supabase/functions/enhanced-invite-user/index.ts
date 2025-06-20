
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
    console.log('List users error:', listUsersError);
    
    const existingUser = existingUserData?.users?.find(u => u.email === email);
    const dashboardUrl = `${req.headers.get('origin') || 'https://pulsify.co.ke'}/admin/${organization.slug}`;
    
    if (existingUser) {
      console.log('User already exists in auth, sending invitation email...');
      
      // For existing users, use inviteUserByEmail to send them an invitation
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: dashboardUrl,
        data: {
          organization_name: organization.name,
          organization_slug: organization.slug,
          organization_id: organizationId,
          role: role,
          enhanced_role: enhancedRole || role,
          inviter_email: user.email || 'Admin',
          is_existing_user: true
        }
      });

      if (inviteError) {
        console.error('Email invitation error for existing user:', inviteError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to send invitation email: ${inviteError.message}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Invitation email sent successfully to existing user');

      // Add existing user to organization after successful email invitation
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
        // Note: Email was sent but org assignment failed
        return new Response(JSON.stringify({
          success: false,
          error: 'Email sent but failed to add user to organization. Please try again.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'User added to organization and invitation email sent',
        type: 'direct_add',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating new user and sending invitation email...');

    // For new users, use inviteUserByEmail which creates the user AND sends the email
    const { data: newUserInvite, error: newUserInviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: dashboardUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organizationId,
        role: role,
        enhanced_role: enhancedRole || role,
        inviter_email: user.email || 'Admin',
        is_new_user: true
      }
    });

    if (newUserInviteError) {
      console.error('Email invitation error for new user:', newUserInviteError);
      return new Response(JSON.stringify({
        success: false,
        error: `Failed to send invitation email: ${newUserInviteError.message}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Invitation email sent successfully to new user');

    // Get the newly invited user to add them to organization
    // Note: inviteUserByEmail creates the user in auth.users
    const { data: updatedUserData } = await supabaseAdmin.auth.admin.listUsers();
    const newlyInvitedUser = updatedUserData?.users?.find(u => u.email === email);

    if (newlyInvitedUser) {
      // Add new user to organization
      const { error: orgInsertError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: newlyInvitedUser.id,
          organization_id: organizationId,
          email: email,
          role: role,
          enhanced_role: enhancedRole || role,
          invited_by_user_id: user.id,
          accepted_at: new Date().toISOString()
        });

      if (orgInsertError) {
        console.error('Error adding new user to organization:', orgInsertError);
        // Note: User was created and email sent, but org assignment failed
        return new Response(JSON.stringify({
          success: false,
          error: 'User created and email sent, but failed to add to organization. Please try again.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
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
        status: 'accepted'
      });

    if (invitationError) {
      console.error('Invitation record error:', invitationError);
      // This is non-critical, so we don't fail the whole operation
    }

    console.log('User invitation process completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'User invitation sent successfully via email',
      type: 'user_invited',
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
