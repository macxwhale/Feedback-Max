
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { InviteUserRequest, InviteUserResponse } from './types.ts';

export const handleExistingUser = async (
  supabaseAdmin: SupabaseClient,
  existingUserId: string,
  inviteData: InviteUserRequest,
  inviterId: string
): Promise<InviteUserResponse> => {
  // Check if user is already in organization
  const { data: existingOrgUser } = await supabaseAdmin
    .from('organization_users')
    .select('user_id')
    .eq('user_id', existingUserId)
    .eq('organization_id', inviteData.organizationId)
    .maybeSingle();

  if (existingOrgUser) {
    console.log('User is already a member of this organization');
    return {
      success: false,
      error: 'User is already a member of this organization'
    };
  }

  // Add existing user directly to organization
  const { error: addError } = await supabaseAdmin
    .from('organization_users')
    .insert({
      user_id: existingUserId,
      organization_id: inviteData.organizationId,
      email: inviteData.email,
      role: inviteData.role,
      enhanced_role: inviteData.enhancedRole,
      status: 'active',
      invited_by_user_id: inviterId,
      accepted_at: new Date().toISOString()
    });

  if (addError) {
    console.error('Error adding existing user to organization:', addError);
    return {
      success: false,
      error: 'Failed to add user to organization. Please try again.'
    };
  }

  console.log('Existing user added to organization successfully');
  return {
    success: true,
    message: 'User successfully added to organization.',
    type: 'direct_add'
  };
};

export const createInvitation = async (
  supabaseAdmin: SupabaseClient,
  inviteData: InviteUserRequest,
  inviterId: string
): Promise<InviteUserResponse> => {
  // Check for existing invitation
  const { data: existingInvitation } = await supabaseAdmin
    .from('user_invitations')
    .select('id')
    .eq('email', inviteData.email)
    .eq('organization_id', inviteData.organizationId)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvitation) {
    console.log('Existing invitation found');
    return {
      success: false,
      error: 'An invitation is already pending for this email address'
    };
  }

  // Create invitation record
  const { error: inviteError } = await supabaseAdmin
    .from('user_invitations')
    .insert({
      email: inviteData.email,
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

  return {
    success: true,
    message: 'Invitation record created successfully',
    type: 'invitation_sent'
  };
};
