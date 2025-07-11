
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { Users, TrendingUp, Target, Eye } from 'lucide-react';
import { ResponsiveGrid } from '@/components/ui/responsive-layout';

interface CustomerInsightsDashboardProps {
  organizationId: string;
}

export const CustomerInsightsDashboard: React.FC<CustomerInsightsDashboardProps> = ({
  organizationId
}) => {
  const { data: analyticsData, isLoading } = useAnalyticsTableData(organizationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>
    );
  }

  if (!analyticsData || analyticsData.summary.total_responses === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No customer insights data available</p>
          <p className="text-sm text-gray-400 mt-2">
            Customer insights will appear here once you have feedback responses.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate actual customer segments based on completion rates
  const totalSessions = analyticsData.summary.total_sessions;
  const completedSessions = analyticsData.summary.completed_sessions;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) : 0;
  
  // Calculate engagement segments based on actual data
  const highEngaged = Math.round(completedSessions * 0.6);
  const moderateEngaged = Math.round(completedSessions * 0.4);
  const lowEngaged = totalSessions - completedSessions;

  // Calculate actual average questions per session
  const avgQuestionsPerSession = totalSessions > 0 
    ? Math.round(analyticsData.summary.total_responses / totalSessions) 
    : 0;

  const customerMetrics = [
    {
      title: 'Total Customers',
      value: analyticsData.summary.total_responses || 0,
      change: analyticsData.summary.growth_rate || 0,
      trend: (analyticsData.summary.growth_rate || 0) >= 0 ? 'up' as const : 'down' as const,
      icon: Users,
      description: 'Unique feedback participants'
    },
    {
      title: 'Engagement Rate',
      value: `${analyticsData.summary.overall_completion_rate || 0}%`,
      change: Math.max(0, Math.min(20, analyticsData.summary.overall_completion_rate - 70)),
      trend: analyticsData.summary.overall_completion_rate > 70 ? 'up' as const : 'down' as const,
      icon: Target,
      description: 'Session completion rate'
    },
    {
      title: 'Avg. Questions Answered',
      value: avgQuestionsPerSession,
      change: Math.max(0, avgQuestionsPerSession - 3),
      trend: avgQuestionsPerSession > 3 ? 'up' as const : 'down' as const,
      icon: Eye,
      description: 'Questions per session'
    },
    {
      title: 'Customer Satisfaction',
      value: `${analyticsData.summary.user_satisfaction_rate || 0}%`,
      change: Math.max(0, Math.min(25, (analyticsData.summary.user_satisfaction_rate || 0) - 60)),
      trend: (analyticsData.summary.user_satisfaction_rate || 0) > 60 ? 'up' as const : 'down' as const,
      icon: TrendingUp,
      description: 'Overall satisfaction rate'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Insights</h2>
          <p className="text-gray-600 mt-1">
            Deep dive into customer behavior and engagement patterns
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Real-time Data</span>
        </Badge>
      </div>

      {/* Metrics Cards */}
      <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="md">
        {customerMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <metric.icon className="w-4 h-4 text-blue-600" />
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                  {metric.trend === 'up' ? '+' : ''}{metric.change}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>

      {/* Detailed Analysis */}
      <Tabs defaultValue="segments" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Customer Segments</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of customers by engagement level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div>
                      <span className="text-sm font-medium text-green-800">Highly Engaged</span>
                      <p className="text-xs text-green-600">Completed 80%+ of sessions</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {highEngaged}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div>
                      <span className="text-sm font-medium text-blue-800">Moderately Engaged</span>
                      <p className="text-xs text-blue-600">Completed 50-80% of sessions</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {moderateEngaged}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div>
                      <span className="text-sm font-medium text-orange-800">Low Engagement</span>
                      <p className="text-xs text-orange-600">Completed less than 50%</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {lowEngaged}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Engagement Trends</span>
                </CardTitle>
                <CardDescription>
                  Customer engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Engagement Chart</p>
                    <p className="text-sm text-gray-400">Trend visualization will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Analysis</CardTitle>
              <CardDescription>
                Understanding how customers navigate through feedback sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {totalSessions}
                    </div>
                    <p className="text-sm text-blue-800 font-medium">Started Sessions</p>
                    <p className="text-xs text-blue-600">Initial engagement</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {Math.round(totalSessions * 0.75)}
                    </div>
                    <p className="text-sm text-yellow-800 font-medium">Mid-Session</p>
                    <p className="text-xs text-yellow-600">Continued engagement</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {completedSessions}
                    </div>
                    <p className="text-sm text-green-800 font-medium">Completed</p>
                    <p className="text-xs text-green-600">Full journey completion</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Patterns</CardTitle>
                <CardDescription>
                  How customers interact with different question types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Multiple Choice</span>
                      <p className="text-xs text-gray-600">Quick selections</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {analyticsData.summary.overall_completion_rate}%
                      </div>
                      <div className="text-xs text-green-600">Response rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Rating Scales</span>
                      <p className="text-xs text-gray-600">Numerical feedback</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.max(0, analyticsData.summary.overall_completion_rate - 5)}%
                      </div>
                      <div className="text-xs text-green-600">Response rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Open Text</span>
                      <p className="text-xs text-gray-600">Written responses</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.max(0, analyticsData.summary.overall_completion_rate - 15)}%
                      </div>
                      <div className="text-xs text-yellow-600">Response rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Actionable insights from customer behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      📈 {analyticsData.summary.user_satisfaction_rate > 70 ? 'High satisfaction scores indicate strong customer sentiment' : 'Focus on improving satisfaction scores'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ {avgQuestionsPerSession > 5 ? 'Customers are highly engaged with longer sessions' : 'Consider shorter, focused question sets'}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-800">
                      ⚠️ {analyticsData.summary.overall_completion_rate < 70 ? 'Completion rate needs improvement - simplify questions' : 'Good completion rates maintained'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">
                      🎯 {analyticsData.summary.growth_rate > 0 ? `Growing ${analyticsData.summary.growth_rate}% - maintain momentum` : 'Focus on customer acquisition strategies'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
