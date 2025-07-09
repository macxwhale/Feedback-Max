
import { createMutation } from './useMutationFactory';
import { toast } from 'sonner';
import { useEnhancedCancelInvitation } from './useEnhancedCancelInvitation';

interface InviteUserParams {
  email: string;
  organizationId: string;
  role: string;
}

interface CancelInvitationParams {
  invitationId: string;
}

interface RemoveUserParams {
  userId: string;
  organizationId: string;
}

interface InviteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
  type?: 'direct_add' | 'invitation';
  invitation_id?: string;
}

interface CancelInvitationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

interface RemoveUserResponse {
  success: boolean;
  error?: string;
  message?: string;
}

const QUERY_KEYS = {
  ORGANIZATION_MEMBERS: ['organization-members'],
  ORGANIZATION_INVITATIONS: ['organization-invitations'],
};

export const useInviteUser = () => {
  return createMutation<InviteUserParams, InviteUserResponse>({
    rpcName: 'invite_user_to_organization',
    queryKeysToInvalidate: [QUERY_KEYS.ORGANIZATION_MEMBERS, QUERY_KEYS.ORGANIZATION_INVITATIONS],
    successMessage: '',
    errorMessage: 'Failed to invite user',
    paramsMapper: ({ email, organizationId, role }) => ({
      p_email: email,
      p_organization_id: organizationId,
      p_role: role
    }),
    onSuccessCustom: (data) => {
      if (data.type === 'direct_add') {
        toast.success('User added to organization successfully!');
      } else {
        toast.success('Invitation sent successfully!');
      }
    },
  });
};

// Use the enhanced cancellation hook
export const useCancelInvitation = useEnhancedCancelInvitation;

export const useRemoveUser = () => {
  return createMutation<RemoveUserParams, RemoveUserResponse>({
    rpcName: 'remove_user_from_organization',
    queryKeysToInvalidate: [QUERY_KEYS.ORGANIZATION_MEMBERS],
    successMessage: 'User removed from organization successfully',
    errorMessage: 'Failed to remove user',
    paramsMapper: ({ userId, organizationId }) => ({
      p_user_id: userId,
      p_organization_id: organizationId
    }),
  });
};
