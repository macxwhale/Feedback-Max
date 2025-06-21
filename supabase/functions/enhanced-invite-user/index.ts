
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withRBAC, type RBACContext } from '../_shared/rbac-middleware.ts';

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

const handler = async (req: Request, context: RBACContext): Promise<Response> => {
  try {
    const { email, organizationId, role, enhancedRole } = await req.json();
    console.log('Processing enhanced invite for:', email, 'to organization:', organizationId);

    // Validate input
    if (!email || !organizationId || !role) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: email, organizationId, and role are required' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get organization details
    const { data: organization } = await supabaseAdmin
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single();

    if (!organization) {
      console.log('Organization not found');
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
          invited_by_user_id: context.userId,
          accepted_at: new Date().toISOString()
        });

      if (addError) {
        console.error('Error adding existing user to organization:', addError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to add user to organization: ' + addError.message,
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Existing user added to organization successfully');
      return new Response(JSON.stringify({
        success: true,
        message: 'User added to organization successfully.',
        type: 'direct_add',
      }), {
        headers: { 'Content-Type': 'application/json' }
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
        inviter_email: context.userId, // Use context from RBAC
        invitation_type: 'organization_invite'
      }
    });

    if (inviteError) {
      console.error('Failed to send invitation email:', inviteError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send invitation email: ' + inviteError.message,
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Invitation email sent successfully via Supabase');

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully. The user will receive an email to join the organization.',
      type: 'invitation_sent',
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in enhanced-invite-user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An error occurred while inviting the user' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

// Apply RBAC middleware with required permission
serve(withRBAC({
  requiredPermission: 'manage_users',
  requireOrgMembership: true,
  allowSystemAdmin: true
})(handler));
