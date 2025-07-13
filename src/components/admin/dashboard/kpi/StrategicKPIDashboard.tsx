
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  calculateSafePerformanceScore, 
  formatSafeTrendValue, 
  calculateSafePercentageChange 
} from '@/utils/metricCalculations';

interface StrategicKPIDashboardProps {
  organizationId: string;
}

export const StrategicKPIDashboard: React.FC<StrategicKPIDashboardProps> = ({
  organizationId
}) => {
  const { data: analyticsData, isLoading } = useAnalyticsTableData(organizationId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData || analyticsData.summary.total_sessions === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-800">Overall Performance Score</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">--</div>
            <p className="text-xs text-green-600">No data available</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-orange-800">User Satisfaction</span>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-700 mb-1">--</div>
            <p className="text-xs text-orange-600">No sessions yet</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-800">Growth Trajectory</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">--</div>
            <p className="text-xs text-green-600">No growth data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = analyticsData.summary;
  
  // Use safe performance score calculation
  const performanceScore = calculateSafePerformanceScore({
    completionRate: summary.overall_completion_rate,
    satisfactionRate: summary.user_satisfaction_rate,
    responseRate: summary.response_rate
  });

  const userSatisfaction = `${Math.round((summary.avg_score || 0) * 10) / 10}/5`;
  
  // Use safe growth rate (already calculated in the hook)
  const growthRate = summary.growth_rate;

  console.log('Strategic KPI calculations:', {
    performanceScore,
    userSatisfaction,
    growthRate,
    summary
  });

  // Determine status and colors based on actual performance
  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return { status: 'excellent', color: 'green', icon: CheckCircle };
    if (score >= 60) return { status: 'good', color: 'orange', icon: AlertTriangle };
    return { status: 'needs attention', color: 'red', icon: AlertTriangle };
  };

  const getSatisfactionStatus = (avgScore: number) => {
    if (avgScore >= 4) return { status: 'excellent', color: 'green', icon: CheckCircle };
    if (avgScore >= 3) return { status: 'good', color: 'orange', icon: AlertTriangle };
    return { status: 'needs attention', color: 'red', icon: AlertTriangle };
  };

  const getGrowthStatus = (rate: number) => {
    if (rate > 10) return { status: 'positive', color: 'green', icon: TrendingUp };
    if (rate >= -10) return { status: 'stable', color: 'orange', icon: AlertTriangle };
    return { status: 'negative', color: 'red', icon: TrendingDown };
  };

  const performanceStatus = getPerformanceStatus(performanceScore);
  const satisfactionStatus = getSatisfactionStatus(summary.avg_score || 0);
  const growthStatus = getGrowthStatus(growthRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Performance Score */}
      <Card className={`border-${performanceStatus.color}-200 bg-${performanceStatus.color}-50`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium text-${performanceStatus.color}-800`}>
              Overall Performance Score
            </span>
            <Badge variant="outline" className={`text-${performanceStatus.color}-700`}>
              <performanceStatus.icon className="w-3 h-3 mr-1" />
              {formatSafeTrendValue(performanceScore >= 80 ? 5 : performanceScore >= 60 ? 2 : -3)}
            </Badge>
          </div>
          <div className={`text-2xl font-bold text-${performanceStatus.color}-700 mb-1`}>
            {performanceScore}%
          </div>
          <p className={`text-xs text-${performanceStatus.color}-600`}>
            Composite performance across all metrics
          </p>
        </CardContent>
      </Card>

      {/* User Satisfaction */}
      <Card className={`border-${satisfactionStatus.color}-200 bg-${satisfactionStatus.color}-50`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium text-${satisfactionStatus.color}-800`}>
              User Satisfaction
            </span>
            <Badge variant="outline" className={`text-${satisfactionStatus.color}-700`}>
              <satisfactionStatus.icon className="w-3 h-3 mr-1" />
              {formatSafeTrendValue((summary.avg_score || 0) >= 4 ? 8 : (summary.avg_score || 0) >= 3 ? 2 : -5)}
            </Badge>
          </div>
          <div className={`text-2xl font-bold text-${satisfactionStatus.color}-700 mb-1`}>
            {userSatisfaction}
          </div>
          <p className={`text-xs text-${satisfactionStatus.color}-600`}>
            Average user rating across all sessions
          </p>
        </CardContent>
      </Card>

      {/* Growth Trajectory */}
      <Card className={`border-${growthStatus.color}-200 bg-${growthStatus.color}-50`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium text-${growthStatus.color}-800`}>
              Growth Trajectory
            </span>
            <Badge variant="outline" className={`text-${growthStatus.color}-700`}>
              <growthStatus.icon className="w-3 h-3 mr-1" />
              {formatSafeTrendValue(Math.abs(growthRate))} {growthRate > 0 ? 'growth' : 'change'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold text-${growthStatus.color}-700 mb-1`}>
            {growthRate > 0 ? '+' : ''}{formatSafeTrendValue(growthRate)}
          </div>
          <p className={`text-xs text-${growthStatus.color}-600`}>
            Month-over-month growth rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
