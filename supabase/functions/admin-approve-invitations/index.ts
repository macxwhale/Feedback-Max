import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("`admin-approve-invitations` function initialized.");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: isAdmin, error: isAdminError } = await supabaseClient.rpc('get_current_user_admin_status');
    if (isAdminError) {
        console.error("[admin-approve-invitations] Error checking admin status:", isAdminError.message);
        throw isAdminError;
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'You must be a system admin to perform this action.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('user_invitations')
      .select('*')
      .eq('status', 'pending');

    if (invitationsError) {
        console.error("[admin-approve-invitations] Error fetching invitations:", invitationsError.message);
        throw invitationsError;
    }

    if (!invitations || invitations.length === 0) {
      return new Response(JSON.stringify({ approvedCount: 0, failedCount: 0, message: "No pending invitations to approve." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let approvedCount = 0;
    let failedCount = 0;

    let allUsers: User[] = [];
    let page = 1;
    while (true) {
      const { data: { users: userBatch }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error("[admin-approve-invitations] Error fetching users:", error.message);
        throw error;
      }
      allUsers.push(...userBatch);
      if (userBatch.length < 1000) break;
      page++;
    }
    const userMap = new Map(allUsers.map(u => [u.email, u.id]));
    
    for (const invitation of invitations) {
        const userId = userMap.get(invitation.email);

        if (!userId) {
            failedCount++;
            continue; // User does not exist, cannot approve.
        }

        const { data: existingMembership, error: checkError } = await supabaseAdmin
            .from('organization_users')
            .select('id, organization_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (checkError) {
            console.error(`Error checking membership for ${invitation.email}:`, checkError.message);
            failedCount++;
            continue;
        }

        if (existingMembership) {
            if (existingMembership.organization_id === invitation.organization_id) {
                await supabaseAdmin
                    .from('user_invitations')
                    .update({ status: 'accepted', updated_at: new Date().toISOString() })
                    .eq('id', invitation.id);
                approvedCount++;
            } else {
                await supabaseAdmin
                    .from('user_invitations')
                    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                    .eq('id', invitation.id);
                failedCount++;
            }
            continue;
        }

        const { error: insertError } = await supabaseAdmin
            .from('organization_users')
            .insert({
                user_id: userId,
                organization_id: invitation.organization_id,
                role: invitation.role,
                email: invitation.email,
                status: 'active',
                accepted_at: new Date().toISOString(),
                invited_by_user_id: invitation.invited_by_user_id
            });

        if (insertError) {
            console.error(`Error inserting user ${invitation.email} into org:`, insertError.message);
            failedCount++;
            continue;
        }
        
        const { error: updateError } = await supabaseAdmin
            .from('user_invitations')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', invitation.id);

        if (updateError) {
            console.error(`Error updating invitation for ${invitation.email}:`, updateError.message);
            failedCount++;
        } else {
            approvedCount++;
        }
    }

    return new Response(JSON.stringify({ approvedCount, failedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[admin-approve-invitations] Unhandled error:`, error && error.message ? error.message : error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
