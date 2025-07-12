
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, Mail } from 'lucide-react';

interface UserManagementStatsProps {
  totalCount: number;
  users: Array<{ role: string; status: string }>;
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({
  totalCount,
  users
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
