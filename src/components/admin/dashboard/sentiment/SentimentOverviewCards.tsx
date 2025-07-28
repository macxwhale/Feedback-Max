
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Star, MessageSquare } from 'lucide-react';

interface SentimentOverviewCardsProps {
  sentimentStats: {
    positive: number;
    negative: number;
    neutral: number;
  };
  totalQuestions: number;
  overallScore: number;
}

export const SentimentOverviewCards: React.FC<SentimentOverviewCardsProps> = ({
  sentimentStats,
  totalQuestions,
  overallScore
}) => {
  const positivePercentage = totalQuestions > 0 ? Math.round((sentimentStats.positive / totalQuestions) * 100) : 0;
  const negativePercentage = totalQuestions > 0 ? Math.round((sentimentStats.negative / totalQuestions) * 100) : 0;
  const neutralPercentage = totalQuestions > 0 ? Math.round((sentimentStats.neutral / totalQuestions) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            High Performing Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {sentimentStats.positive}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            {positivePercentage}% of questions
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 mb-2">
            {sentimentStats.negative}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
            {negativePercentage}% of questions
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Average Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {sentimentStats.neutral}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            {neutralPercentage}% of questions
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {totalQuestions}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
            Questions analyzed
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
