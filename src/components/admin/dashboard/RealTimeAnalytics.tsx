import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

interface RealTimeAnalyticsProps {
  organizationId: string;
}

export const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({
  organizationId
}) => {
  const { liveData, isLoading } = useRealTimeAnalytics(organizationId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  // Don't show active users and avg score
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submissions (Last 10 min)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{liveData.feedbackSubmissions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Time (min)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{liveData.responseTime}</div>
        </CardContent>
      </Card>
    </div>
  );
};
