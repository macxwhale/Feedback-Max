
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target, Brain } from 'lucide-react';
import { AnalyticsData } from '@/services/analyticsService';

interface AnalyticsInsightsProps {
  analytics: AnalyticsData;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ analytics }) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.responseTime}s</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-green-600">{Math.round(analytics.engagementScore)}%</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Satisfaction Trend</span>
            <Badge className={getTrendColor(analytics.satisfactionTrend)}>
              {analytics.satisfactionTrend.replace('_', ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
