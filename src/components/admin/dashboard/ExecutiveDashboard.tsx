
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useExecutiveAnalytics } from '@/hooks/useExecutiveAnalytics';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

interface ExecutiveDashboardProps {
  organizationId: string;
  stats?: any;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  organizationId,
  stats
}) => {
  const { data: kpis, isLoading } = useExecutiveAnalytics(organizationId);

  const alerts = [
    {
      type: 'warning',
      title: 'Response Rate Monitoring',
      message: stats?.completed_sessions && stats?.total_sessions 
        ? `${Math.round((stats.completed_sessions / stats.total_sessions) * 100)}% completion rate`
        : 'Monitor completion rates for insights',
      priority: 'medium'
    },
    {
      type: 'success',
      title: 'Engagement Trends',
      message: stats?.active_members 
        ? `${stats.active_members} active members this period`
        : 'User engagement tracking active',
      priority: 'low'
    },
    {
      type: stats?.avg_session_score && stats.avg_session_score < 3 ? 'critical' : 'success',
      title: 'Satisfaction Monitoring',
      message: stats?.avg_session_score
        ? `Average satisfaction: ${stats.avg_session_score}/5`
        : 'Satisfaction scores being tracked',
      priority: stats?.avg_session_score && stats.avg_session_score < 3 ? 'high' : 'low'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis?.map((kpi, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">
                      {kpi.prefix}{kpi.value}{kpi.suffix}
                    </span>
                    <Badge variant={kpi.isPositive ? 'default' : 'destructive'} className="text-xs">
                      {kpi.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {kpi.prefix}{kpi.target}{kpi.suffix}</span>
                      <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                    </div>
                    <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                  </div>
                </div>
                <div className="w-8 h-8 text-blue-600">
                  {kpi.title.includes('Satisfaction') && <Target className="w-8 h-8" />}
                  {kpi.title.includes('Response') && <Users className="w-8 h-8" />}
                  {kpi.title.includes('Time') && <Clock className="w-8 h-8" />}
                  {kpi.title.includes('Cost') && <DollarSign className="w-8 h-8" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Critical Insights & Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'critical' ? 'border-l-red-500 bg-red-50' :
                alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-green-500 bg-green-50'
              }`}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <Badge variant={
                    alert.priority === 'high' ? 'destructive' :
                    alert.priority === 'medium' ? 'outline' : 'secondary'
                  }>
                    {alert.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Period</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{stats?.avg_session_score || 'N/A'}/5</span>
                  <Badge variant="default" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Tracked
                  </Badge>
                </div>
              </div>
              <Progress value={stats?.avg_session_score ? (stats.avg_session_score / 5) * 100 : 0} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {stats?.total_sessions && stats?.completed_sessions
                      ? `${Math.round((stats.completed_sessions / stats.total_sessions) * 100)}%`
                      : 'N/A'
                    }
                  </span>
                  <Badge variant="default" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
              <Progress value={
                stats?.total_sessions && stats?.completed_sessions
                  ? (stats.completed_sessions / stats.total_sessions) * 100
                  : 0
              } className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data-Driven Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.avg_session_score && stats.avg_session_score < 3 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-900">Improve Satisfaction</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <p className="text-xs text-red-700 mt-1">Score below 3.0 - immediate attention needed</p>
                </div>
              )}
              
              {stats?.total_sessions && stats.completed_sessions && 
               (stats.completed_sessions / stats.total_sessions) < 0.8 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-900">Optimize Completion</span>
                    <Badge variant="outline">High</Badge>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">Completion rate below 80% - streamline process</p>
                </div>
              )}
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Continue Monitoring</span>
                  <Badge variant="secondary">Ongoing</Badge>
                </div>
                <p className="text-xs text-blue-700 mt-1">Regular tracking active - {stats?.total_responses || 0} responses collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
