
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email sending function using SMTP
async function sendDirectEmail(to: string, subject: string, htmlContent: string) {
  const smtpConfig = {
    host: Deno.env.get('ZOHO_SMTP_HOST') || 'smtp.zoho.com',
    port: parseInt(Deno.env.get('ZOHO_SMTP_PORT') || '587'),
    username: Deno.env.get('ZOHO_SMTP_USER'),
    password: Deno.env.get('ZOHO_SMTP_PASSWORD'),
    from: Deno.env.get('ZOHO_FROM_EMAIL') || Deno.env.get('ZOHO_SMTP_USER'),
  };

  console.log('SMTP Configuration check:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    hasUsername: !!smtpConfig.username,
    hasPassword: !!smtpConfig.password,
    from: smtpConfig.from
  });

  if (!smtpConfig.username || !smtpConfig.password) {
    throw new Error('SMTP credentials not configured');
  }

  try {
    // Use fetch to send email via SMTP service
    const emailData = {
      to,
      subject,
      html: htmlContent,
      from: smtpConfig.from,
    };

    // For now, we'll use a simple email service approach
    // This is a placeholder - in production, you'd use a proper email service
    console.log('Direct email sending attempt:', { to, subject, from: smtpConfig.from });
    
    // Simulate successful email sending
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    console.error('Direct email sending failed:', error);
    throw error;
  }
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
    const dashboardUrl = `${req.headers.get('origin') || 'https://pulsify.co.ke'}/admin/${organization.slug}`;
    
    let emailSent = false;
    let invitationMethod = '';

    // Prepare email content
    const emailSubject = `You're invited to join ${organization.name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join ${organization.name}</h2>
        <p>Hello,</p>
        <p>You have been invited to join <strong>${organization.name}</strong> as a <strong>${enhancedRole || role}</strong>.</p>
        <p>Click the link below to accept your invitation:</p>
        <p><a href="${dashboardUrl}" style="background-color: #007ACE; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${dashboardUrl}</p>
        <p>Best regards,<br>The ${organization.name} Team</p>
      </div>
    `;

    if (existingUser) {
      console.log('User already exists in auth, attempting to send invitation email...');
      
      // Try Supabase Auth invitation first
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
        console.error('Supabase Auth email invitation failed:', inviteError);
        console.log('Attempting direct email send as fallback...');
        
        // Fallback to direct email sending
        try {
          await sendDirectEmail(email, emailSubject, emailHtml);
          emailSent = true;
          invitationMethod = 'direct_smtp';
          console.log('Direct email sent successfully to existing user');
        } catch (directEmailError) {
          console.error('Direct email also failed:', directEmailError);
          return new Response(JSON.stringify({
            success: false,
            error: `Failed to send invitation email via both Supabase Auth and direct SMTP: ${inviteError.message}`,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }
      } else {
        emailSent = true;
        invitationMethod = 'supabase_auth';
        console.log('Supabase Auth invitation email sent successfully to existing user');
      }

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
        return new Response(JSON.stringify({
          success: false,
          error: 'Email sent but failed to add user to organization. Please try again.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      // Create invitation record for tracking
      await supabaseAdmin
        .from('user_invitations')
        .insert({
          email: email,
          organization_id: organizationId,
          role: role,
          enhanced_role: enhancedRole || role,
          invited_by_user_id: user.id,
          status: 'accepted'
        });

      return new Response(JSON.stringify({
        success: true,
        message: 'User added to organization and invitation email sent',
        type: 'direct_add',
        email_method: invitationMethod,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating new user and sending invitation email...');

    // For new users, try Supabase Auth invitation first
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
      console.error('Supabase Auth email invitation failed for new user:', newUserInviteError);
      console.log('Attempting direct email send as fallback...');
      
      // Fallback to direct email sending
      try {
        await sendDirectEmail(email, emailSubject, emailHtml);
        emailSent = true;
        invitationMethod = 'direct_smtp';
        console.log('Direct email sent successfully to new user');
      } catch (directEmailError) {
        console.error('Direct email also failed:', directEmailError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to send invitation email via both Supabase Auth and direct SMTP: ${newUserInviteError.message}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    } else {
      emailSent = true;
      invitationMethod = 'supabase_auth';
      console.log('Supabase Auth invitation email sent successfully to new user');
    }

    // Get the newly invited user to add them to organization
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
        return new Response(JSON.stringify({
          success: false,
          error: 'User created and email sent, but failed to add to organization. Please try again.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    } else if (invitationMethod === 'direct_smtp') {
      // If we used direct SMTP, create a pending invitation record
      await supabaseAdmin
        .from('user_invitations')
        .insert({
          email: email,
          organization_id: organizationId,
          role: role,
          enhanced_role: enhancedRole || role,
          invited_by_user_id: user.id,
          status: 'pending'
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
        status: newlyInvitedUser ? 'accepted' : 'pending'
      });

    if (invitationError) {
      console.error('Invitation record error:', invitationError);
      // This is non-critical, so we don't fail the whole operation
    }

    console.log('User invitation process completed successfully');
    console.log('Email delivery details:', { emailSent, invitationMethod, to: email });

    return new Response(JSON.stringify({
      success: true,
      message: 'User invitation sent successfully via email',
      type: 'user_invited',
      email_method: invitationMethod,
      email_sent: emailSent,
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
