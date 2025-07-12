
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateRequestBody } from './validation.ts';
import { authenticateUser, findExistingUser } from './auth.ts';
import { checkUserPermissions } from './permissions.ts';
import { getOrganization } from './organization.ts';
import { handleExistingUser, createInvitation } from './user-management.ts';
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

    // Check if user exists
    const { userId: existingUserId, exists: userExists } = await findExistingUser(
      supabaseAdmin, 
      inviteData.email
    );

    let result: InviteUserResponse;

    if (userExists && existingUserId) {
      // Handle existing user
      result = await handleExistingUser(
        supabaseAdmin, 
        existingUserId, 
        inviteData, 
        user.id
      );
    } else {
      // Create invitation for new user
      result = await createInvitation(supabaseAdmin, inviteData, user.id);
      
      if (result.success) {
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
        
        result.message = 'Invitation sent successfully! The user will receive an email to join the organization.';
      }
    }

    return createResponse(result, result.success ? 200 : 400);

  } catch (error) {
    console.error('Error in enhanced-invite-user:', error);
    return createResponse({ 
      success: false, 
      error: 'An unexpected error occurred while sending the invitation. Please try again.' 
    }, 500);
  }
});
