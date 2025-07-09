import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail } from 'lucide-react';
import { EnhancedRoleBadge } from '../EnhancedRoleBadge';
import { SystemInvitation } from '@/hooks/useSystemUsers';
import { isExpiringSoon } from '@/utils/roleManagement';

interface SystemInvitationsTableProps {
  invitations: SystemInvitation[];
}

export const SystemInvitationsTable: React.FC<SystemInvitationsTableProps> = ({ invitations }) => {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p>No pending invitations found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const expiring = isExpiringSoon(invitation.expires_at);
            
            return (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.email}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{invitation.organizations.name}</div>
                    <div className="text-sm text-gray-500">/{invitation.organizations.slug}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <EnhancedRoleBadge role={invitation.role} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{invitation.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className={expiring ? 'text-red-600' : ''}>
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </span>
                    {expiring && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Soon
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(invitation.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
