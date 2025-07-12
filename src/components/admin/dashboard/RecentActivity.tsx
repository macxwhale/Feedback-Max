
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, Users } from 'lucide-react';
import { useOrganizationStats } from '@/hooks/useOrganizationStats';
import { formatDistanceToNow } from 'date-fns';
import { ActivityItemSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from './EmptyState';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';

interface RecentActivityProps {
  organizationId: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  organizationId 
}) => {
  const { data: stats, isLoading } = useOrganizationStats(organizationId);

  const recentActivity = stats?.recent_activity || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session':
        return Clock;
      case 'member':
        return Users;
      default:
        return Activity;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'in_progress':
        return 'secondary' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <DashboardErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index: number) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        <ActivityIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Feedback {activity.type} {activity.status === 'completed' ? 'completed' : 'started'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Activity will appear here as users interact with your feedback forms and complete sessions."
            />
          )}
        </CardContent>
      </Card>
    </DashboardErrorBoundary>
  );
};
