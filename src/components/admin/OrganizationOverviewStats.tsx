
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

interface OrganizationOverviewStatsProps {
  stats: {
    memberCount: number;
    sessionCount: number;
  } | null;
  statsLoading: boolean;
}

export const OrganizationOverviewStats: React.FC<OrganizationOverviewStatsProps> = ({ 
  stats, 
  statsLoading 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.memberCount || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Feedback Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.sessionCount || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">87%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
