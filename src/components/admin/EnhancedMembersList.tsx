
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, User, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EnhancedRoleBadge } from './EnhancedRoleBadge';
import { EnhancedRoleSelector } from './EnhancedRoleSelector';
import { UserAvatar } from './UserAvatar';
import { formatDate, getStatusBadgeVariant } from '@/utils/roleManagement';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { canManageRole } from '@/utils/roleManagement';
import { Badge } from '@/components/ui/badge';

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

interface EnhancedMembersListProps {
  members: Member[];
  loading: boolean;
  organizationId: string;
  onUpdateRole: (userId: string, newRole: string) => void;
  onRemoveMember: (userId: string) => void;
}

export const EnhancedMembersList: React.FC<EnhancedMembersListProps> = ({
  members,
  loading,
  organizationId,
  onUpdateRole,
  onRemoveMember
}) => {
  const { userRole, canManageUsers } = useEnhancedPermissions(organizationId);

  const handleRoleChange = (member: Member, newRole: string) => {
    onUpdateRole(member.user_id, newRole);
  };

  const canEditMember = (member: Member) => {
    if (!canManageUsers()) return false;
    if (!userRole) return false;
    
    const memberRole = member.enhanced_role || member.role || 'member';
    return canManageRole(userRole, memberRole);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading members...</div>
        </CardContent>
      </Card>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No members found</p>
            <p className="text-sm">Invite users to get started</p>
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
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const memberRole = member.enhanced_role || member.role || 'member';
              const canEdit = canEditMember(member);
              
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <UserAvatar email={member.email} />
                      <div>
                        <div className="font-medium">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <EnhancedRoleSelector
                        currentUserRole={userRole || 'member'}
                        selectedRole={memberRole}
                        onRoleChange={(newRole) => handleRoleChange(member, newRole)}
                      />
                    ) : (
                      <EnhancedRoleBadge role={memberRole} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.accepted_at 
                      ? formatDate(member.accepted_at)
                      : formatDate(member.created_at)
                    }
                  </TableCell>
                  <TableCell>
                    {member.invited_by?.email || '-'}
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.email} from this organization? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onRemoveMember(member.user_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
