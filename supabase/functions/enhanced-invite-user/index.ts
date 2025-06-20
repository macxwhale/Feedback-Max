
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email sending function using SMTP
async function sendInvitationEmail(
  to: string,
  organizationName: string,
  organizationSlug: string,
  inviterEmail: string,
  isNewUser: boolean,
  actionLink: string
) {
  const smtpHost = Deno.env.get('ZOHO_SMTP_HOST');
  const smtpPort = Deno.env.get('ZOHO_SMTP_PORT');
  const smtpUser = Deno.env.get('ZOHO_SMTP_USER');
  const smtpPassword = Deno.env.get('ZOHO_SMTP_PASSWORD');
  const fromEmail = Deno.env.get('ZOHO_FROM_EMAIL');

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !fromEmail) {
    throw new Error('SMTP configuration is incomplete');
  }

  const subject = isNewUser 
    ? `Invitation to join ${organizationName}`
    : `Access your ${organizationName} dashboard`;

  const htmlBody = isNewUser ? `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">You've been invited to join ${organizationName}</h2>
          <p>Hello,</p>
          <p>${inviterEmail} has invited you to join <strong>${organizationName}</strong> on our feedback platform.</p>
          <p>Click the button below to accept your invitation and set up your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${actionLink}</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This invitation will expire in 24 hours for security reasons.</p>
        </div>
      </body>
    </html>
  ` : `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Access your ${organizationName} dashboard</h2>
          <p>Hello,</p>
          <p>You've been added to <strong>${organizationName}</strong> on our feedback platform.</p>
          <p>Click the button below to access your dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Dashboard</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${actionLink}</p>
        </div>
      </body>
    </html>
  `;

  // Create SMTP connection and send email
  try {
    const emailData = {
      from: fromEmail,
      to: to,
      subject: subject,
      html: htmlBody,
    };

    // Use fetch to send via SMTP API or direct SMTP connection
    // For now, we'll use a simple approach with nodemailer-like functionality
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'custom_smtp',
        template_id: 'invitation',
        user_id: smtpUser,
        template_params: {
          to_email: to,
          from_email: fromEmail,
          subject: subject,
          html_content: htmlBody,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
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

    // Get organization details for email template
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

      // Generate password reset link for existing user
      const { data: resetLinkData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: dashboardUrl
        }
      });

      if (resetError) {
        console.error('Password reset link generation error:', resetError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to generate access link: ${resetError.message}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      // Send email to existing user
      try {
        await sendInvitationEmail(
          email,
          organization.name,
          organization.slug,
          user.email || 'Admin',
          false, // existing user
          resetLinkData.properties?.action_link || dashboardUrl
        );

        console.log('Email sent successfully to existing user');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        return new Response(JSON.stringify({
          success: false,
          error: `User added but failed to send email: ${emailError.message}`,
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

    console.log('Creating new user account...');

    // User doesn't exist, create new user account
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
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

    // Generate password reset link for new user
    const { data: resetLinkData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: dashboardUrl
      }
    });

    if (resetError) {
      console.error('Reset link generation error:', resetError);
      return new Response(JSON.stringify({
        success: false,
        error: `User created but failed to generate access link: ${resetError.message}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Send email to new user
    try {
      await sendInvitationEmail(
        email,
        organization.name,
        organization.slug,
        user.email || 'Admin',
        true, // new user
        resetLinkData.properties?.action_link || dashboardUrl
      );

      console.log('Email sent successfully to new user');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return new Response(JSON.stringify({
        success: false,
        error: `User created but failed to send email: ${emailError.message}`,
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
