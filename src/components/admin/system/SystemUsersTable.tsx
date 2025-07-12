
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';
import { EnhancedRoleBadge } from '../EnhancedRoleBadge';
import { SystemUser } from '@/hooks/useSystemUsers';

interface SystemUsersTableProps {
  users: SystemUser[];
  onAssignUser: (user: SystemUser) => void;
}

export const SystemUsersTable: React.FC<SystemUsersTableProps> = ({ users, onAssignUser }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found in the system.
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
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={`${user.user_id}-${user.organization_id}`}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                {user.organizations ? (
                  <div>
                    <div className="font-medium">{user.organizations.name}</div>
                    <div className="text-sm text-gray-500">/{user.organizations.slug}</div>
                  </div>
                ) : (
                  <span className="text-gray-400">No organization</span>
                )}
              </TableCell>
              <TableCell>
                <EnhancedRoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {user.organization_user_created_at 
                  ? new Date(user.organization_user_created_at).toLocaleDateString()
                  : new Date(user.created_at).toLocaleDateString()
                }
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAssignUser(user)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
