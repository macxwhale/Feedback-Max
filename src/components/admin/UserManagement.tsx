
import React from 'react';
import { EnhancedMembersList } from './EnhancedMembersList';
import { useUserManagement } from '@/hooks/useUserManagement';
import { SimpleUserManagementHeader } from './SimpleUserManagementHeader';
import { MemberStats } from './MemberStats';
import { EnhancedInviteUserModal } from './EnhancedInviteUserModal';
import { useRemoveUser } from '@/hooks/useUserInvitation';

interface UserManagementProps {
  organizationId: string;
  organizationName: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  organizationId,
  organizationName
}) => {
  const {
    membersLoading,
    handleUpdateRole,
    activeMembers,
  } = useUserManagement(organizationId);

  const removeUserMutation = useRemoveUser();

  const handleRemoveMember = (userId: string) => {
    removeUserMutation.mutate({ userId, organizationId });
  };

  const adminsCount = activeMembers.filter(m => {
    const role = m.enhanced_role || m.role;
    return ['admin', 'owner'].includes(role);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SimpleUserManagementHeader organizationName={organizationName} />
        <EnhancedInviteUserModal organizationId={organizationId} />
      </div>

      <MemberStats
        activeMembersCount={activeMembers.length}
        adminsCount={adminsCount}
        pendingInvitationsCount={0}
      />

      <EnhancedMembersList
        members={activeMembers}
        loading={membersLoading}
        organizationId={organizationId}
        onUpdateRole={handleUpdateRole}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
};
