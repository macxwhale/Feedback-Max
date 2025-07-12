
import React, { useState } from 'react';
import { useSystemUserManagementData, useAssignUserToOrg, SystemUser, useApproveAllInvitations } from '@/hooks/useSystemUsers';
import { SystemUsersTable } from './SystemUsersTable';
import { SystemInvitationsTable } from './SystemInvitationsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { AssignUserToOrgModal } from './AssignUserToOrgModal';
import { Organization } from '@/services/organizationService.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SystemUserManagementProps {
  organizations: Organization[];
}

export const SystemUserManagement: React.FC<SystemUserManagementProps> = ({ organizations }) => {
  const { data, isLoading, error } = useSystemUserManagementData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const assignUserMutation = useAssignUserToOrg();
  const approveAllMutation = useApproveAllInvitations();

  const handleOpenModal = (user: SystemUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleAssignUser = (userId: string, email: string, organizationId: string, role: string) => {
    assignUserMutation.mutate(
      { userId, email, organizationId, role },
      {
        onSuccess: () => {
          toast.success(`User ${email} assigned successfully.`);
          handleCloseModal();
        },
        onError: (error: any) => {
          toast.error(`Failed to assign user: ${error.message}`);
        },
      }
    );
  };

  const handleApproveAll = () => {
    approveAllMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Approval process complete. ${data.approvedCount} invitations approved.`);
        if (data.failedCount > 0) {
          toast.info(`${data.failedCount} invitations could not be approved (e.g. user not registered).`);
        }
      },
      onError: (error: any) => {
        toast.error(`Failed to approve invitations: ${error.message}`);
      }
    });
  };

  if (isLoading) {
    return <EnhancedLoadingSpinner text="Loading system-wide user data..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Organization Users</CardTitle>
          <CardDescription>A comprehensive list of all users across all organizations with their enhanced roles. You can assign existing users to new organizations from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <SystemUsersTable users={data?.users || []} onAssignUser={handleOpenModal} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Pending Invitations</CardTitle>
            <CardDescription>A comprehensive list of all pending invitations across all organizations with enhanced role information.</CardDescription>
          </div>
          {data?.invitations && data.invitations.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={approveAllMutation.isPending}>
                  {approveAllMutation.isPending ? 'Approving...' : 'Approve All Pending'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will attempt to approve all pending invitations for which a user account already exists.
                    Users will be added to the respective organizations with their designated enhanced roles. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApproveAll} disabled={approveAllMutation.isPending}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          <SystemInvitationsTable invitations={data?.invitations || []} />
        </CardContent>
      </Card>

      <AssignUserToOrgModal
        isOpen={isModalOpen}
        user={selectedUser}
        organizations={organizations}
        onClose={handleCloseModal}
        onSubmit={handleAssignUser}
        isSubmitting={assignUserMutation.isPending}
      />
    </div>
  );
};
