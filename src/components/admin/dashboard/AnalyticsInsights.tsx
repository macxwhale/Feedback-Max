
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  Users,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface AnalyticsInsightsProps {
  stats?: {
    total_questions: number;
    total_responses: number;
    total_sessions: number;
    completed_sessions: number;
    active_members: number;
    avg_session_score?: number;
    growth_metrics: {
      sessions_this_month: number;
      sessions_last_month: number;
      growth_rate: number | null;
    };
  };
  isLoading?: boolean;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({
  stats,
  isLoading = false
}) => {
  console.log('AnalyticsInsights - Rendering with stats:', stats);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show fallback content if no stats
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analytics insights will appear here once data is available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const insights = [
    {
      title: 'Response Rate',
      value: stats.total_sessions > 0 
        ? `${Math.round((stats.completed_sessions / stats.total_sessions) * 100)}%` 
        : '0%',
      trend: stats.growth_metrics?.growth_rate || 0,
      isPositive: (stats.growth_metrics?.growth_rate || 0) >= 0,
      icon: MessageSquare,
      description: 'Session completion rate this month'
    },
    {
      title: 'User Engagement',
      value: stats.active_members || 0,
      trend: 8,
      isPositive: true,
      icon: Users,
      description: 'Active members this month'
    },
    {
      title: 'Response Quality',
      value: stats.total_questions > 0 
        ? `${Math.round((stats.total_responses / stats.total_questions) * 100)}%`
        : '0%',
      trend: 5,
      isPositive: true,
      icon: CheckCircle,
      description: 'Average responses per question'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  insight.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <insight.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{insight.value}</span>
                <Badge variant={insight.isPositive ? 'default' : 'destructive'} className="flex items-center space-x-1">
                  {insight.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(insight.trend)}%</span>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
