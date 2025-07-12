
import { useActiveMembers } from './useUserQueries';
import { useUpdateUserRole } from './useUserMutations';

export const useUserManagement = (organizationId: string) => {
  const {
    activeMembers,
    isLoading: membersLoading,
    error: membersError,
  } = useActiveMembers(organizationId);

  const updateRoleMutation = useUpdateUserRole(organizationId);

  const handleUpdateRole = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  return {
    activeMembers,
    membersLoading,
    membersError,
    handleUpdateRole,
    updateRoleMutation,
  };
};
