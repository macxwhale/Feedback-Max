
import React from 'react';
import { EnhancedMembersList } from './EnhancedMembersList';
import { useUserManagementWithInvitations } from '@/hooks/useUserManagementWithInvitations';
import { SimpleUserManagementHeader } from './SimpleUserManagementHeader';
import { MemberStats } from './MemberStats';
import { EnhancedInviteUserModal } from './EnhancedInviteUserModal';
import { PendingInvitations } from './PendingInvitations';
import { PerformanceDashboard } from './performance/PerformanceDashboard';
import { useRemoveUser } from '@/hooks/useUserInvitation';
import { useRBAC } from '@/hooks/useRBAC';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserManagementProps {
  organizationId: string;
  organizationName: string;
}

// Define the member type that matches what we expect
interface Member {
  id: string;
  user_id: string;
  email: string;
  role?: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  accepted_at?: string;
  invited_by?: { email: string } | null;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  organizationId,
  organizationName
}) => {
  const {
    membersLoading,
    handleUpdateRole,
    activeMembers,
    pendingInvitations,
    invitationsLoading,
    pendingInvitationsCount,
    handleCancelInvitation,
  } = useUserManagementWithInvitations(organizationId);

  const removeUserMutation = useRemoveUser();
  const { hasPermission, userRole, isLoading: rbacLoading } = useRBAC(organizationId);

  const handleRemoveMember = (userId: string) => {
    if (!hasPermission('manage_users')) {
      console.warn('User attempted to remove member without permission');
      return;
    }
    removeUserMutation.mutate({ userId, organizationId });
  };

  const handleRoleUpdate = (userId: string, newRole: string) => {
    if (!hasPermission('manage_users')) {
      console.warn('User attempted to update role without permission');
      return;
    }
    handleUpdateRole(userId, newRole);
  };

  if (rbacLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  // Check if user has permission to manage users
  if (!hasPermission('manage_users')) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage users. Contact your organization administrator for access.
        </AlertDescription>
      </Alert>
    );
  }

  const adminsCount = activeMembers.filter((m: Member) => {
    const role = m.enhanced_role || m.role;
    return ['admin', 'owner'].includes(role || '');
  }).length;

  console.log('UserManagement rendered with:', {
    userRole,
    hasManageUsersPermission: hasPermission('manage_users'),
    activeMembersCount: activeMembers.length,
    pendingInvitationsCount
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SimpleUserManagementHeader organizationName={organizationName} />
        <EnhancedInviteUserModal organizationId={organizationId} />
      </div>

      <MemberStats
        activeMembersCount={activeMembers.length}
        adminsCount={adminsCount}
        pendingInvitationsCount={pendingInvitationsCount}
      />

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Active Members ({activeMembers.length})</TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations ({pendingInvitationsCount})
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members">
          <EnhancedMembersList
            members={activeMembers as Member[]}
            loading={membersLoading}
            organizationId={organizationId}
            onUpdateRole={handleRoleUpdate}
            onRemoveMember={handleRemoveMember}
          />
        </TabsContent>
        
        <TabsContent value="invitations">
          <PendingInvitations
            invitations={pendingInvitations}
            loading={invitationsLoading}
            onCancelInvitation={handleCancelInvitation}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
