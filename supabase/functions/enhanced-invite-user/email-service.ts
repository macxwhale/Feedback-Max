
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
  const baseUrl = getBaseUrl(req);
  // Change redirect to go directly to auth page with invitation parameters
  const redirectUrl = `${baseUrl}/auth?invitation=true&org=${organization.slug}`;
  
  console.log('Using redirect URL for invitation:', redirectUrl);

  const { data: inviteResponse, error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: redirectUrl,
      data: {
        organization_name: organization.name,
        organization_slug: organization.slug,
        organization_id: organization.id,
        role: role,
        enhanced_role: enhancedRole,
        inviter_email: inviterEmail,
        invitation_type: 'organization_invite'
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

  console.log('Invitation email sent successfully via Supabase');
  return { success: true };
};
