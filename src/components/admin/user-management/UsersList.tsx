
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedLoadingSpinner } from '../dashboard/EnhancedLoadingSpinner';
import { PaginationControls } from '../dashboard/PaginationControls';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface UsersListProps {
  users: User[];
  totalCount: number;
  isLoading: boolean;
  searchTerm: string;
  roleFilter: string;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  totalCount,
  isLoading,
  searchTerm,
  roleFilter,
  currentPage,
  totalPages,
  hasMore,
  onPageChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({totalCount})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <EnhancedLoadingSpinner text="Loading users..." />
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || roleFilter ? 'No users match your filters' : 'No users found'}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-600">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {users.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};
