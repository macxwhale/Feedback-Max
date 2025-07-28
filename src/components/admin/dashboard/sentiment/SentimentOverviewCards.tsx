
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Frown, Meh } from 'lucide-react';

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
  totalQuestions
}) => {
  const positivePercentage = totalQuestions > 0 ? Math.round((sentimentStats.positive / totalQuestions) * 100) : 0;
  const negativePercentage = totalQuestions > 0 ? Math.round((sentimentStats.negative / totalQuestions) * 100) : 0;
  const neutralPercentage = totalQuestions > 0 ? Math.round((sentimentStats.neutral / totalQuestions) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
          <Smile className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{positivePercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {sentimentStats.positive} out of {totalQuestions} questions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
          <Frown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{negativePercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {sentimentStats.negative} out of {totalQuestions} questions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Neutral Sentiment</CardTitle>
          <Meh className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{neutralPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {sentimentStats.neutral} out of {totalQuestions} questions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
