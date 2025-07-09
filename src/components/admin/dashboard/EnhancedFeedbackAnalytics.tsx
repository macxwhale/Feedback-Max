
import React, { useState } from 'react';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Activity,
  Clock,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { ResponsiveGrid } from '@/components/ui/responsive-layout';

interface EnhancedFeedbackAnalyticsProps {
  organizationId: string;
}

export const EnhancedFeedbackAnalytics: React.FC<EnhancedFeedbackAnalyticsProps> = ({ 
  organizationId 
}) => {
  const { data: analyticsData, isLoading, error, refetch } = useAnalyticsTableData(organizationId);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading feedback analytics: {error.message}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No analytics data available for this organization.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate average response time from analytics data
  const avgResponseTime = analyticsData.questions.length > 0 
    ? analyticsData.questions.reduce((sum, q) => sum + (q.avg_response_time_ms || 0), 0) / analyticsData.questions.length
    : 0;
  
  const avgResponseTimeMinutes = Math.round(avgResponseTime / 60000 * 10) / 10; // Convert to minutes with 1 decimal

  const metrics = [
    {
      title: 'Total Responses',
      value: analyticsData.summary.total_responses,
      change: analyticsData.summary.growth_rate,
      trend: analyticsData.summary.growth_rate >= 0 ? 'up' as const : 'down' as const,
      icon: MessageSquare,
      description: 'All time feedback responses'
    },
    {
      title: 'Active Sessions',
      value: analyticsData.summary.total_sessions,
      change: Math.abs(analyticsData.summary.growth_rate),
      trend: analyticsData.summary.growth_rate >= 0 ? 'up' as const : 'down' as const,
      icon: Activity,
      description: 'Total feedback sessions'
    },
    {
      title: 'Completion Rate',
      value: `${analyticsData.summary.overall_completion_rate}%`,
      change: 5,
      trend: 'up' as const,
      icon: Target,
      description: 'Session completion percentage'
    },
    {
      title: 'Avg. Response Time',
      value: avgResponseTimeMinutes > 0 ? `${avgResponseTimeMinutes}min` : '0min',
      change: -8,
      trend: 'down' as const,
      icon: Clock,
      description: 'Average time per response'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Analytics</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your feedback collection performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="md">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <metric.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <Badge variant="outline" className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs">Live Data</span>
          </Badge>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Response Distribution</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of responses by category and type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.categories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{category.category}</span>
                      <Badge variant="secondary">
                        {category.total_responses}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance Summary</span>
                </CardTitle>
                <CardDescription>
                  Key performance indicators at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min(analyticsData.summary.response_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.summary.response_rate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">User Satisfaction</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(analyticsData.summary.user_satisfaction_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.summary.user_satisfaction_rate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(analyticsData.summary.avg_score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.summary.avg_score}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Trends</CardTitle>
              <CardDescription>
                Historical data showing feedback collection patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Trend Chart</p>
                  <p className="text-sm text-gray-400">Visual trends will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.summary.growth_rate > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Response rate increased by {analyticsData.summary.growth_rate}% this month
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      ℹ {analyticsData.summary.completed_sessions} sessions completed successfully
                    </p>
                  </div>
                  {analyticsData.summary.overall_completion_rate < 70 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-800">
                        ⚠ Completion rate needs attention ({analyticsData.summary.overall_completion_rate}%)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.summary.overall_completion_rate < 70 && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium mb-1">Optimize Form Length</p>
                      <p className="text-xs text-gray-600">
                        Consider shorter forms to improve completion rates
                      </p>
                    </div>
                  )}
                  {analyticsData.summary.user_satisfaction_rate < 75 && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium mb-1">Improve User Experience</p>
                      <p className="text-xs text-gray-600">
                        Focus on enhancing the feedback collection process
                      </p>
                    </div>
                  )}
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium mb-1">Monitor Performance</p>
                    <p className="text-xs text-gray-600">
                      Regular tracking of key metrics for continuous improvement
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
