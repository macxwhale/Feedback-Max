
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface ProcessInvitationRequest {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const createResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    status
  });
};

serve(async (req: Request) => {
  console.log('Process invitation function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let body;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      body = JSON.parse(bodyText);
      console.log('Parsed body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return createResponse({ 
        success: false, 
        error: 'Invalid request body - must be valid JSON' 
      }, 400);
    }

    const { token, password, firstName, lastName } = body as ProcessInvitationRequest;

    if (!token || !password) {
      return createResponse({ 
        success: false, 
        error: 'Token and password are required' 
      }, 400);
    }

    // Validate invitation token and get invitation details
    console.log('Validating invitation token:', token);
    
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('user_invitations')
      .select(`
        id,
        email,
        organization_id,
        role,
        enhanced_role,
        status,
        expires_at,
        invited_by_user_id,
        organizations!inner(id, name, slug)
      `)
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      console.error('Invalid invitation token:', invitationError);
      return createResponse({ 
        success: false, 
        error: 'Invalid or expired invitation token' 
      }, 400);
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      console.error('Invitation has expired');
      return createResponse({ 
        success: false, 
        error: 'This invitation has expired' 
      }, 400);
    }

    console.log('Valid invitation found for email:', invitation.email);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === invitation.email.toLowerCase().trim());

    let userId: string;

    if (existingUser) {
      // User exists, update their password
      console.log('User exists, updating password');
      userId = existingUser.id;
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (updateError) {
        console.error('Failed to update user password:', updateError);
        return createResponse({ 
          success: false, 
          error: 'Failed to update password' 
        }, 500);
      }
    } else {
      // Create new user
      console.log('Creating new user for email:', invitation.email);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: invitation.email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName || '',
          last_name: lastName || '',
          invitation_token: token
        }
      });

      if (createError || !newUser.user) {
        console.error('Failed to create user:', createError);
        return createResponse({ 
          success: false, 
          error: 'Failed to create user account' 
        }, 500);
      }

      userId = newUser.user.id;
    }

    // Check if user is already in the organization
    const { data: existingOrgUser } = await supabaseAdmin
      .from('organization_users')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', invitation.organization_id)
      .single();

    if (!existingOrgUser) {
      // Add user to organization
      console.log('Adding user to organization');
      
      const { error: orgUserError } = await supabaseAdmin
        .from('organization_users')
        .insert({
          user_id: userId,
          organization_id: invitation.organization_id,
          email: invitation.email,
          role: invitation.role,
          enhanced_role: invitation.enhanced_role,
          status: 'active',
          invited_by_user_id: invitation.invited_by_user_id,
          accepted_at: new Date().toISOString()
        });

      if (orgUserError) {
        console.error('Failed to add user to organization:', orgUserError);
        return createResponse({ 
          success: false, 
          error: 'Failed to add user to organization' 
        }, 500);
      }
    }

    // Update invitation status
    const { error: updateInvitationError } = await supabaseAdmin
      .from('user_invitations')
      .update({ 
        status: 'accepted', 
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateInvitationError) {
      console.error('Failed to update invitation status:', updateInvitationError);
    }

    // Log invitation event
    await supabaseAdmin
      .from('invitation_events')
      .insert({
        invitation_id: invitation.id,
        event_type: 'accepted',
        event_data: {
          user_id: userId,
          accepted_at: new Date().toISOString()
        }
      });

    console.log('Invitation processed successfully');
    
    return createResponse({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        organization: invitation.organizations,
        user_id: userId,
        redirect_url: `/admin/${invitation.organizations.slug}`
      }
    });

  } catch (error) {
    console.error('Error in process-invitation:', error);
    return createResponse({ 
      success: false, 
      error: 'An unexpected error occurred while processing the invitation. Please try again.' 
    }, 500);
  }
});
