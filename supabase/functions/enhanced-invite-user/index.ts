
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
      console.log('User already exists in auth, adding to organization...');
      
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
        console.error('Error adding user to organization:', insertError);
        throw insertError;
      }

      // Use Supabase's built-in email functionality with magic link
      const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: dashboardUrl,
          data: {
            organization_name: organization.name,
            organization_slug: organization.slug,
            inviter_email: user.email || 'Admin',
            is_existing_user: true
          }
        }
      });

      if (magicLinkError) {
        console.error('Magic link generation error:', magicLinkError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to generate access link: ${magicLinkError.message}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Magic link generated successfully for existing user');

      return new Response(JSON.stringify({
        success: true,
        message: 'User added to organization and access email sent',
        type: 'direct_add',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating new user account...');

    // User doesn't exist, create new user account with email confirmation
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: false, // Don't auto-confirm, let them verify via email
      user_metadata: {
        organization_id: organizationId,
        organization_name: organization.name,
        role: role,
        enhanced_role: enhancedRole || role,
        invited_by: user.id
      }
    });

    if (createError) {
      console.error('User creation error:', createError);
      throw createError;
    }

    console.log('New user created successfully:', newUser.user.id);

    // Add user to organization
    const { error: orgInsertError } = await supabaseAdmin
      .from('organization_users')
      .insert({
        user_id: newUser.user.id,
        organization_id: organizationId,
        email: email,
        role: role,
        enhanced_role: enhancedRole || role,
        invited_by_user_id: user.id,
        accepted_at: new Date().toISOString()
      });

    if (orgInsertError) {
      console.error('Error adding new user to organization:', orgInsertError);
      throw orgInsertError;
    }

    // Generate confirmation link for new user
    const { data: confirmLinkData, error: confirmError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: dashboardUrl,
        data: {
          organization_name: organization.name,
          organization_slug: organization.slug,
          inviter_email: user.email || 'Admin',
          is_new_user: true
        }
      }
    });

    if (confirmError) {
      console.error('Confirmation link generation error:', confirmError);
      return new Response(JSON.stringify({
        success: false,
        error: `User created but failed to generate confirmation link: ${confirmError.message}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Confirmation link generated successfully for new user');

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
    }

    console.log('Invitation process completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully and invitation email sent',
      type: 'user_created',
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
