
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface PerformanceOverviewCardsProps {
  performanceInsights: {
    fastRespondingQuestions: number;
    slowRespondingQuestions: number;
    avgCompletionRate: number;
    totalResponses: number;
    avgResponseTime: number;
  };
  totalQuestions: number;
}

export const PerformanceOverviewCards: React.FC<PerformanceOverviewCardsProps> = ({
  performanceInsights,
  totalQuestions
}) => {
  // Calculate a realistic performance score based on actual metrics
  const calculatePerformanceScore = () => {
    if (totalQuestions === 0 || performanceInsights.totalResponses === 0) {
      return 0;
    }

    // Weight different factors:
    // - Completion rate (40% weight)
    // - Response time efficiency (30% weight) - lower is better, cap at 10 seconds
    // - Question engagement (30% weight) - ratio of fast to total questions
    
    const completionScore = performanceInsights.avgCompletionRate;
    
    const responseTimeScore = Math.max(0, 100 - (performanceInsights.avgResponseTime / 100)); // Normalize response time
    
    const engagementScore = totalQuestions > 0 
      ? (performanceInsights.fastRespondingQuestions / totalQuestions) * 100 
      : 0;
    
    const overallScore = (completionScore * 0.4) + (responseTimeScore * 0.3) + (engagementScore * 0.3);
    
    return Math.round(Math.min(100, Math.max(0, overallScore)));
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <div className="grid grid-cols-1 max-w-2xl mx-auto">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-blue-600" />
              <span className="text-base font-semibold text-gray-700">Overall Performance Score</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-4">
            {performanceScore}%
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            {totalQuestions === 0 || performanceInsights.totalResponses === 0
              ? "Performance score will appear once you have feedback responses."
              : "Composite score measuring response speed, completion rates, and user engagement across all feedback sessions."
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
