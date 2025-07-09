import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, X, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EnhancedRoleBadge } from './EnhancedRoleBadge';
import { formatDate, isExpiringSoon } from '@/utils/roleManagement';

interface Invitation {
  id: string;
  email: string;
  role: string;
  enhanced_role?: string;
  status: string;
  created_at: string;
  expires_at: string;
  invited_by?: { email: string };
}

interface PendingInvitationsProps {
  invitations: Invitation[];
  loading: boolean;
  onCancelInvitation: (invitationId: string) => void;
}

const ExpiryStatus: React.FC<{ expiresAt: string }> = ({ expiresAt }) => {
  const expiring = isExpiringSoon(expiresAt);
  
  return (
    <div className="flex items-center space-x-2">
      <span className={expiring ? 'text-red-600' : ''}>
        {formatDate(expiresAt)}
      </span>
      {expiring && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Expiring Soon
        </Badge>
      )}
    </div>
  );
};

const CancelInvitationButton: React.FC<{ 
  invitation: Invitation; 
  onCancel: (id: string) => void; 
}> = ({ invitation, onCancel }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
        <X className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to cancel the invitation for {invitation.email}?
          They will no longer be able to join using this invitation.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => onCancel(invitation.id)}
          className="bg-red-600 hover:bg-red-700"
        >
          Cancel Invitation
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const PendingInvitations: React.FC<PendingInvitationsProps> = ({
  invitations,
  loading,
  onCancelInvitation
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invitations...</div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No pending invitations</p>
            <p className="text-sm">All invitations have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const role = invitation.enhanced_role || invitation.role;
              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{invitation.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EnhancedRoleBadge role={role} />
                  </TableCell>
                  <TableCell>
                    {formatDate(invitation.created_at)}
                  </TableCell>
                  <TableCell>
                    <ExpiryStatus expiresAt={invitation.expires_at} />
                  </TableCell>
                  <TableCell>
                    {invitation.invited_by?.email || '-'}
                  </TableCell>
                  <TableCell>
                    <CancelInvitationButton 
                      invitation={invitation} 
                      onCancel={onCancelInvitation} 
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
