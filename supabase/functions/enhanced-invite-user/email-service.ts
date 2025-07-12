
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Organization } from './types.ts';

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

export const sendInvitationEmail = async (
  supabaseAdmin: SupabaseClient,
  email: string,
  organization: Organization,
  role: string,
  enhancedRole: string,
  inviterEmail: string,
  req: Request
): Promise<{ success: boolean; error?: string }> => {
  // Get the invitation token
  const { data: invitation } = await supabaseAdmin
    .from('user_invitations')
    .select('invitation_token')
    .eq('email', email)
    .eq('organization_id', organization.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!invitation) {
    console.error('Could not find invitation token for email:', email);
    return {
      success: false,
      error: 'Could not find invitation token'
    };
  }

  const baseUrl = getBaseUrl(req);
  // Use the new invitation acceptance URL with token
  const invitationUrl = `${baseUrl}/invitation/accept/${invitation.invitation_token}`;
  
  console.log('Using invitation URL:', invitationUrl);

  const { data: inviteResponse, error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: invitationUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organization.id,
        role: role,
        enhanced_role: enhancedRole,
        inviter_email: inviterEmail,
        invitation_type: 'organization_invite',
        invitation_token: invitation.invitation_token,
        invitation_url: invitationUrl
      }
    }
  );

  if (emailError) {
    console.error('Failed to send invitation email:', emailError);
    
    // Update invitation status to indicate email failed
    await supabaseAdmin
      .from('user_invitations')
      .update({ status: 'email_failed' })
      .eq('email', email)
      .eq('organization_id', organization.id);
    
    return {
      success: false,
      error: 'Failed to send invitation email. Please check the email address and try again.'
    };
  }

  // Update invitation status to sent
  await supabaseAdmin
    .from('user_invitations')
    .update({ status: 'sent' })
    .eq('email', email)
    .eq('organization_id', organization.id);

  console.log('Invitation email sent successfully via Supabase');
  return { success: true };
};
