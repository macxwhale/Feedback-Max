
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateRequestBody } from './validation.ts';
import { authenticateUser } from './auth.ts';
import { checkUserPermissions } from './permissions.ts';
import { getOrganization } from './organization.ts';
import { createInvitation } from './user-management.ts';
import { sendInvitationEmail } from './email-service.ts';
import { InviteUserResponse } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const createResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    status
  });
};

serve(async (req: Request) => {
  console.log('Enhanced invite function called with method:', req.method);
  
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
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid authorization header');
      return createResponse({ 
        success: false, 
        error: 'Authentication required' 
      }, 401);
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Authenticate user
    const { user, error: authError } = await authenticateUser(supabaseClient);
    if (authError || !user) {
      return createResponse({ success: false, error: authError }, 401);
    }

    // Parse and validate request body
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

    const validation = validateRequestBody(body);
    if (!validation.isValid) {
      return createResponse({ success: false, error: validation.error }, 400);
    }

    const inviteData = validation.data!;

    // Check permissions
    const { hasPermission, error: permError } = await checkUserPermissions(
      supabaseClient, 
      user.id, 
      inviteData.organizationId
    );
    
    if (!hasPermission) {
      return createResponse({ success: false, error: permError }, 403);
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get organization details
    const { organization, error: orgError } = await getOrganization(
      supabaseAdmin, 
      inviteData.organizationId
    );
    
    if (orgError || !organization) {
      return createResponse({ success: false, error: orgError }, 404);
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from('user_invitations')
      .select('id')
      .eq('email', inviteData.email.toLowerCase().trim())
      .eq('organization_id', inviteData.organizationId)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      console.log('Existing invitation found');
      return createResponse({
        success: false,
        error: 'An invitation is already pending for this email address'
      }, 400);
    }

    // Check if user already exists and is already in the organization
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === inviteData.email.toLowerCase().trim());

    if (existingUser) {
      const { data: existingOrgUser } = await supabaseAdmin
        .from('organization_users')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('organization_id', inviteData.organizationId)
        .single();

      if (existingOrgUser) {
        console.log('User is already a member of this organization');
        return createResponse({
          success: false,
          error: 'User is already a member of this organization'
        }, 400);
      }
    }

    // Create invitation for the user (whether they exist or not)
    const result = await createInvitation(supabaseAdmin, inviteData, user.id);
    
    if (!result.success) {
      return createResponse(result, 400);
    }

    // Send invitation email
    const emailResult = await sendInvitationEmail(
      supabaseAdmin,
      inviteData.email,
      organization,
      inviteData.role,
      inviteData.enhancedRole,
      user.email || 'system',
      req
    );
    
    if (!emailResult.success) {
      return createResponse({ success: false, error: emailResult.error }, 500);
    }
    
    const finalResult: InviteUserResponse = {
      ...result,
      message: 'Invitation sent successfully! The user will receive an email with instructions to join the organization.',
      type: 'invitation_sent'
    };

    return createResponse(finalResult, 200);

  } catch (error) {
    console.error('Error in enhanced-invite-user:', error);
    return createResponse({ 
      success: false, 
      error: 'An unexpected error occurred while sending the invitation. Please try again.' 
    }, 500);
  }
});
