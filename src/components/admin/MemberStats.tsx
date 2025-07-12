
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, Mail } from 'lucide-react';

interface MemberStatsProps {
  activeMembersCount: number;
  adminsCount: number;
  pendingInvitationsCount: number;
}

export const MemberStats: React.FC<MemberStatsProps> = ({
  activeMembersCount,
  adminsCount,
  pendingInvitationsCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-sunset-600" />
            <div>
              <div className="text-2xl font-bold">{activeMembersCount}</div>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-coral-500" />
            <div>
              <div className="text-2xl font-bold">{adminsCount}</div>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-golden-500" />
            <div>
              <div className="text-2xl font-bold">{pendingInvitationsCount}</div>
              <p className="text-sm text-gray-600">Pending Invitations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
