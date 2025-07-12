
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Users,
  Star,
  Zap
} from 'lucide-react';
import { StrategicKPIDashboard } from './kpi/StrategicKPIDashboard';
import { AdvancedSentimentAnalysis } from './sentiment/AdvancedSentimentAnalysis';
import { useExecutiveInsights } from '@/hooks/useExecutiveInsights';

interface ExecutiveSummaryDashboardProps {
  organizationId: string;
}

export const ExecutiveSummaryDashboard: React.FC<ExecutiveSummaryDashboardProps> = ({
  organizationId
}) => {
  const { data: insights, isLoading } = useExecutiveInsights(organizationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Alerts */}
      {insights && insights.alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Critical Alerts</h3>
          {insights.alerts.map((alert, index) => (
            <Alert key={index} className={alert.type === 'warning' ? 'border-yellow-500' : 'border-red-500'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Strategic KPIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Strategic KPIs</h3>
        <StrategicKPIDashboard organizationId={organizationId} />
      </div>

      {/* Key Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Achievements
                </h4>
                <ul className="space-y-2">
                  {insights.achievements.map((achievement, index) => (
                    <li key={index} className="text-sm text-green-600 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-orange-700 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {insights.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-orange-600 flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Sentiment Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Sentiment Intelligence</h3>
        <AdvancedSentimentAnalysis organizationId={organizationId} />
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {insights && (
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-blue-900">{rec.title}</h5>
                      <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {rec.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
