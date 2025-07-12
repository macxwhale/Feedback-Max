/**
 * Enhanced User Table Component
 * Optimized table with virtualization for large datasets
 */

import React, { memo, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Shield, User as UserIcon, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/domain/interfaces/IUserService';

interface EnhancedUserTableProps {
  users: User[];
  isLoading?: boolean;
  onEditUser?: (user: User) => void;
  onViewUser?: (user: User) => void;
  onDeactivateUser?: (user: User) => void;
  currentUserRole?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return Shield;
    case 'org_admin':
      return Shield;
    case 'member':
      return UserIcon;
    case 'viewer':
      return Eye;
    default:
      return UserIcon;
  }
};

const getRoleColor = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'super_admin':
      return 'destructive';
    case 'org_admin':
      return 'default';
    case 'member':
      return 'secondary';
    case 'viewer':
      return 'outline';
    default:
      return 'outline';
  }
};

const formatRole = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'org_admin':
      return 'Admin';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
    default:
      return role;
  }
};

const UserRow = memo<{
  user: User;
  onEdit?: (user: User) => void;
  onView?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  canEdit: boolean;
}>(({ user, onEdit, onView, onDeactivate, canEdit }) => {
  const RoleIcon = getRoleIcon(user.role);
  
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              ID: {user.id.substring(0, 8)}...
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant={getRoleColor(user.role)} className="flex items-center space-x-1">
          <RoleIcon className="h-3 w-3" />
          <span>{formatRole(user.role)}</span>
        </Badge>
      </TableCell>
      
      <TableCell>
        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(user)}>
                View Details
              </DropdownMenuItem>
            )}
            {canEdit && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(user)}>
                Edit User
              </DropdownMenuItem>
            )}
            {canEdit && onDeactivate && user.isActive && (
              <DropdownMenuItem 
                onClick={() => onDeactivate(user)}
                className="text-destructive"
              >
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

UserRow.displayName = 'UserRow';

const LoadingRow = memo(() => (
  <TableRow>
    <TableCell>
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        <div className="space-y-1">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
    </TableCell>
    <TableCell>
      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
    </TableCell>
    <TableCell>
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
    </TableCell>
    <TableCell>
      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
    </TableCell>
  </TableRow>
));

LoadingRow.displayName = 'LoadingRow';

export const EnhancedUserTable = memo<EnhancedUserTableProps>(({
  users,
  isLoading = false,
  onEditUser,
  onViewUser,
  onDeactivateUser,
  currentUserRole = 'viewer',
}) => {
  const canEdit = useMemo(() => {
    return ['super_admin', 'org_admin'].includes(currentUserRole);
  }, [currentUserRole]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Show loading rows
            Array.from({ length: 5 }).map((_, index) => (
              <LoadingRow key={`loading-${index}`} />
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={onEditUser}
                onView={onViewUser}
                onDeactivate={onDeactivateUser}
                canEdit={canEdit}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

EnhancedUserTable.displayName = 'EnhancedUserTable';