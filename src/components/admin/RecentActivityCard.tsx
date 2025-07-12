
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { EnhancedLoadingSpinner } from './dashboard/EnhancedLoadingSpinner';

interface RecentSession {
  type: string;
  status: string;
  created_at: string;
}

interface RecentActivityCardProps {
  recentSessions?: RecentSession[];
  statsLoading?: boolean;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  recentSessions = [],
  statsLoading = false
}) => {
  // Safely handle the data with proper fallbacks
  const sessions = Array.isArray(recentSessions) ? recentSessions : [];
  const displaySessions = sessions.slice(0, 5); // Now safely slice the array

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statsLoading ? (
          <EnhancedLoadingSpinner text="Loading recent activity..." />
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activity found
          </div>
        ) : (
          <div className="space-y-3">
            {displaySessions.map((session, index) => (
              <div key={`${session.created_at}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <p className="font-medium capitalize">{session.type} Session</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(session.status) as any}>
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
