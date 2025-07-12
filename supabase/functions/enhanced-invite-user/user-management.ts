
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { InviteUserRequest, InviteUserResponse } from './types.ts';

export const createInvitation = async (
  supabaseAdmin: SupabaseClient,
  inviteData: InviteUserRequest,
  inviterId: string
): Promise<InviteUserResponse> => {
  // Create invitation record
  const { error: inviteError } = await supabaseAdmin
    .from('user_invitations')
    .insert({
      email: inviteData.email.toLowerCase().trim(),
      organization_id: inviteData.organizationId,
      role: inviteData.role,
      enhanced_role: inviteData.enhancedRole,
      invited_by_user_id: inviterId,
      status: 'pending'
    });

  if (inviteError) {
    console.error('Failed to create invitation:', inviteError);
    return {
      success: false,
      error: 'Failed to create invitation. Please try again.'
    };
  }

  console.log('Invitation created successfully for:', inviteData.email);
  return {
    success: true,
    message: 'Invitation record created successfully',
    type: 'invitation_sent'
  };
};

// Remove the handleExistingUser function as it's no longer needed
// All users now go through the invitation acceptance flow
