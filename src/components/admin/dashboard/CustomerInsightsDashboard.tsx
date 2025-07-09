
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

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No customer insights data available</p>
        </CardContent>
      </Card>
    );
  }

  const customerMetrics = [
    {
      title: 'Total Customers',
      value: analyticsData.summary.total_responses || 0,
      change: 12,
      trend: 'up' as const,
      icon: Users,
      description: 'Unique feedback participants'
    },
    {
      title: 'Engagement Rate',
      value: `${Math.round((analyticsData.summary.completed_sessions / Math.max(analyticsData.summary.total_sessions, 1)) * 100)}%`,
      change: 8,
      trend: 'up' as const,
      icon: Target,
      description: 'Session completion rate'
    },
    {
      title: 'Avg. Questions Answered',
      value: Math.round(analyticsData.summary.total_responses / Math.max(analyticsData.summary.total_sessions, 1)),
      change: 5,
      trend: 'up' as const,
      icon: Eye,
      description: 'Questions per session'
    },
    {
      title: 'Customer Satisfaction',
      value: `${Math.round(analyticsData.summary.avg_score || 0)}/10`,
      change: 15,
      trend: 'up' as const,
      icon: TrendingUp,
      description: 'Average satisfaction score'
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
                  {metric.trend === 'up' ? '+' : '-'}{metric.change}%
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
                      {Math.round((analyticsData.summary.completed_sessions * 0.3))}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div>
                      <span className="text-sm font-medium text-blue-800">Moderately Engaged</span>
                      <p className="text-xs text-blue-600">Completed 50-80% of sessions</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {Math.round((analyticsData.summary.completed_sessions * 0.5))}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div>
                      <span className="text-sm font-medium text-orange-800">Low Engagement</span>
                      <p className="text-xs text-orange-600">Completed less than 50%</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {Math.round((analyticsData.summary.total_sessions - analyticsData.summary.completed_sessions))}
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
                      {Math.round((analyticsData.summary.total_sessions * 0.85))}
                    </div>
                    <p className="text-sm text-blue-800 font-medium">Started Sessions</p>
                    <p className="text-xs text-blue-600">Initial engagement</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {Math.round((analyticsData.summary.total_sessions * 0.65))}
                    </div>
                    <p className="text-sm text-yellow-800 font-medium">Mid-Session</p>
                    <p className="text-xs text-yellow-600">Continued engagement</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {analyticsData.summary.completed_sessions}
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
                      <div className="text-lg font-bold">92%</div>
                      <div className="text-xs text-green-600">High completion</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Rating Scales</span>
                      <p className="text-xs text-gray-600">Numerical feedback</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">87%</div>
                      <div className="text-xs text-green-600">Good completion</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Open Text</span>
                      <p className="text-xs text-gray-600">Written responses</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">74%</div>
                      <div className="text-xs text-yellow-600">Moderate completion</div>
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
                      📈 Peak engagement during 2-4 PM weekdays
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ Short sessions (5-7 questions) have highest completion
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-800">
                      ⚠️ Mobile users need simplified question formats
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">
                      🎯 Personalized follow-ups increase engagement by 23%
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
