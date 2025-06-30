
import { useUserManagement } from '@/hooks/useUserManagement';
import { useOrganizationInvitations } from '@/hooks/useOrganizationInvitations';
import { useCancelInvitation } from '@/hooks/useUserInvitation';

export const useUserManagementWithInvitations = (organizationId: string) => {
  const userManagement = useUserManagement(organizationId);
  const { 
    data: pendingInvitations = [], 
    isLoading: invitationsLoading,
    error: invitationsError 
  } = useOrganizationInvitations(organizationId);
  const cancelInvitationMutation = useCancelInvitation();

  const handleCancelInvitation = (invitationId: string) => {
    cancelInvitationMutation.mutate({ invitationId });
  };

  return {
    ...userManagement,
    pendingInvitations,
    invitationsLoading,
    invitationsError,
    pendingInvitationsCount: pendingInvitations.length,
    handleCancelInvitation,
    cancelInvitationLoading: cancelInvitationMutation.isPending,
  };
};
