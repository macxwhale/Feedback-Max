
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { getResponseTimeColor, getCompletionColor } from './performanceUtils';

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
            {Math.round((performanceInsights.avgCompletionRate + (5000 - performanceInsights.avgResponseTime) / 50) / 2)}%
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Composite score measuring response speed, completion rates, and user engagement across all feedback sessions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
