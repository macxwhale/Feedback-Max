
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity,
  Download,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { ResponsiveGrid } from '@/components/ui/responsive-layout';

interface AnalyticsDashboardProps {
  organizationId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  organizationId
}) => {
  const { data: analyticsData, isLoading } = useAnalyticsTableData(organizationId);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate Overall Performance (0-100)
  const overallPerformance = Math.round(
    (analyticsData.summary.overall_completion_rate * 0.4) +
    (analyticsData.summary.user_satisfaction_rate * 0.4) +
    (Math.min(Math.max(analyticsData.summary.growth_rate + 50, 0), 100) * 0.2)
  );

  // Determine status based on performance
  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 60) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 40) return { status: 'needs attention', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const performanceStatus = getPerformanceStatus(overallPerformance);

  // Key Performance Indicators
  const kpis = [
    {
      title: 'Overall Performance',
      value: `${overallPerformance}%`,
      change: analyticsData.summary.growth_rate,
      trend: analyticsData.summary.growth_rate >= 0 ? 'up' : 'down',
      icon: Target,
      description: 'Composite score based on completion, satisfaction, and growth',
      calculation: 'Completion Rate (40%) + User Satisfaction (40%) + Growth (20%)'
    },
    {
      title: 'User Satisfaction',
      value: `${analyticsData.summary.user_satisfaction_rate}%`,
      change: 12,
      trend: 'up' as const,
      icon: Users,
      description: 'Percentage of users rating 4+ stars',
      calculation: 'High ratings (4-5 stars) / Total completed sessions'
    },
    {
      title: 'Response Collection',
      value: `${analyticsData.summary.response_rate}%`,
      change: 8,
      trend: 'up' as const,
      icon: MessageSquare,
      description: 'Average responses per session',
      calculation: 'Total responses / (Questions × Sessions)'
    },
    {
      title: 'Growth Trajectory',
      value: `${analyticsData.summary.growth_rate > 0 ? '+' : ''}${analyticsData.summary.growth_rate}%`,
      change: Math.abs(analyticsData.summary.growth_rate),
      trend: analyticsData.summary.growth_rate >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      description: 'Month-over-month session growth',
      calculation: '(Current month sessions - Previous month) / Previous month'
    }
  ];

  const handleExportAnalytics = () => {
    const csvData = [
      ['Metric', 'Value', 'Calculation Method'],
      ['Overall Performance', `${overallPerformance}%`, 'Completion Rate (40%) + User Satisfaction (40%) + Growth (20%)'],
      ['User Satisfaction', `${analyticsData.summary.user_satisfaction_rate}%`, 'High ratings (4-5 stars) / Total completed sessions'],
      ['Completion Rate', `${analyticsData.summary.overall_completion_rate}%`, 'Completed sessions / Total sessions'],
      ['Response Rate', `${analyticsData.summary.response_rate}%`, 'Total responses / (Questions × Sessions)'],
      ['Growth Rate', `${analyticsData.summary.growth_rate}%`, '(Current month - Previous month) / Previous month'],
      ['Total Sessions', analyticsData.summary.total_sessions.toString(), 'Count of all feedback sessions'],
      ['Completed Sessions', analyticsData.summary.completed_sessions.toString(), 'Count of fully completed sessions'],
      ['Average Score', analyticsData.summary.avg_score.toString(), 'Sum of all session scores / Completed sessions'],
      ['Abandoned Sessions', analyticsData.summary.abandoned_sessions.toString(), 'Total sessions - Completed - In Progress']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your organization's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportAnalytics}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics</span>
          </Button>
          <Badge 
            variant="outline" 
            className={`${performanceStatus.color} ${performanceStatus.bgColor} capitalize`}
          >
            {performanceStatus.status}
          </Badge>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Key Performance Indicators
        </h3>
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} gap="md">
          {kpis.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <kpi.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {kpi.change}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                  <p className="text-xs text-gray-500 mb-2">{kpi.description}</p>
                  <p className="text-xs text-gray-400 italic">
                    Calculation: {kpi.calculation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${performanceStatus.color}`}>
                {overallPerformance}%
              </div>
              <p className="text-sm text-gray-600 mb-1">Overall Performance</p>
              <Badge className={`${performanceStatus.color} ${performanceStatus.bgColor} capitalize`}>
                {performanceStatus.status}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData.summary.user_satisfaction_rate}%
              </div>
              <p className="text-sm text-gray-600 mb-1">User Satisfaction</p>
              <p className="text-xs text-gray-500">
                Based on {analyticsData.summary.completed_sessions} completed sessions
              </p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                analyticsData.summary.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.summary.growth_rate > 0 ? '+' : ''}{analyticsData.summary.growth_rate}%
              </div>
              <p className="text-sm text-gray-600 mb-1">Growth Trajectory</p>
              <p className="text-xs text-gray-500">Month-over-month change</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="collection">Response Collection</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {analyticsData.summary.total_sessions}
                  </div>
                  <p className="text-sm text-blue-800 font-medium">Total Sessions</p>
                  <p className="text-xs text-blue-600">All feedback sessions initiated</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {analyticsData.summary.completed_sessions}
                  </div>
                  <p className="text-sm text-green-800 font-medium">Completed</p>
                  <p className="text-xs text-green-600">Successfully finished sessions</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {analyticsData.summary.abandoned_sessions}
                  </div>
                  <p className="text-sm text-orange-800 font-medium">Abandoned</p>
                  <p className="text-xs text-orange-600">Incomplete sessions</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analyticsData.summary.overall_completion_rate}%
                  </div>
                  <p className="text-sm text-purple-800 font-medium">Completion Rate</p>
                  <p className="text-xs text-purple-600">Session success rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Collection Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <span className="text-sm font-medium">Total Responses Collected</span>
                    <p className="text-xs text-gray-600">Across all questions and sessions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.summary.total_responses}
                    </div>
                    <div className="text-xs text-gray-500">responses</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <span className="text-sm font-medium">Response Rate</span>
                    <p className="text-xs text-gray-600">Average responses per session</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.summary.response_rate}%
                    </div>
                    <div className="text-xs text-gray-500">efficiency</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <span className="text-sm font-medium">Questions Performance</span>
                    <p className="text-xs text-gray-600">Active questions collecting data</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.summary.total_questions}
                    </div>
                    <div className="text-xs text-gray-500">active questions</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Excellent Performance Areas</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    {overallPerformance >= 80 && <li>• Overall performance exceeds 80%</li>}
                    {analyticsData.summary.user_satisfaction_rate >= 75 && <li>• High user satisfaction rate</li>}
                    {analyticsData.summary.overall_completion_rate >= 70 && <li>• Strong session completion rate</li>}
                  </ul>
                </div>
                
                {(overallPerformance < 60 || analyticsData.summary.user_satisfaction_rate < 60) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Areas Needing Attention</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {overallPerformance < 60 && <li>• Overall performance below 60%</li>}
                      {analyticsData.summary.user_satisfaction_rate < 60 && <li>• User satisfaction needs improvement</li>}
                      {analyticsData.summary.response_rate < 50 && <li>• Response collection efficiency is low</li>}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
