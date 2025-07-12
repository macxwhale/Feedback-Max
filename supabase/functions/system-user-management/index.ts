
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This function can only be called by authenticated super-admins.
// It returns a list of all users (from auth.users, via the all_users_with_org view) and pending invitations across all organizations.

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token to check permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Check if user is a super admin
    const { data: isAdmin, error: isAdminError } = await supabaseClient.rpc('get_current_user_admin_status');
    if (isAdminError) throw isAdminError;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'You must be a system admin to access this resource.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    // Once admin status is verified, create a Supabase admin client to perform privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Fetch all users with org info, including enhanced roles
    const { data: usersRaw, error: usersError } = await supabaseAdmin
      .from('all_users_with_org')
      .select(`
        user_id,
        email,
        organization_user_id,
        organization_id,
        role,
        status,
        organization_user_created_at,
        accepted_at,
        invited_by_user_id,
        organizations (
          name,
          slug
        )
      `)
      .order('user_id', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    // Get enhanced roles for users
    const { data: enhancedRoles, error: rolesError } = await supabaseAdmin
      .from('organization_users')
      .select('user_id, organization_id, enhanced_role');

    if (rolesError) {
      console.warn('Could not fetch enhanced roles:', rolesError);
    }

    // Create a map for quick lookup of enhanced roles
    const enhancedRoleMap = new Map();
    enhancedRoles?.forEach(role => {
      enhancedRoleMap.set(`${role.user_id}-${role.organization_id}`, role.enhanced_role);
    });

    // Map organization-less users to a default structure and include enhanced roles
    const users = (usersRaw || []).map((user: any) => ({
      ...user,
      enhanced_role: enhancedRoleMap.get(`${user.user_id}-${user.organization_id}`) || user.role,
      organizations: user.organizations || (user.organization_id ? { name: '', slug: '' } : null),
    }));

    // Fetch all pending invitations with enhanced roles
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('user_invitations')
      .select(`
        id,
        email,
        role,
        enhanced_role,
        status,
        created_at,
        expires_at,
        organization_id,
        invited_by_user_id,
        organizations (
          name,
          slug
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (invitationsError) {
      throw invitationsError;
    }

    return new Response(JSON.stringify({ users, invitations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
