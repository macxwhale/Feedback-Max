
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface SentimentOverviewCardsProps {
  sentimentStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalQuestions: number;
  overallScore: number;
}

export const SentimentOverviewCards: React.FC<SentimentOverviewCardsProps> = ({
  sentimentStats,
  totalQuestions,
  overallScore
}) => {
  if (totalQuestions === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-sm">No sentiment data available</p>
            <p className="text-xs text-gray-400 mt-1">
              Sentiment analysis will appear once you have feedback responses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallSentiment = sentimentStats.positive > sentimentStats.negative ? 'positive' : 
                          sentimentStats.negative > sentimentStats.positive ? 'negative' : 'neutral';

  const sentimentMetrics = [
    {
      title: 'Overall Sentiment',
      value: overallSentiment,
      count: totalQuestions,
      icon: Brain,
      color: overallSentiment === 'positive' ? 'text-green-600' : 
             overallSentiment === 'negative' ? 'text-red-600' : 'text-yellow-600',
      bgColor: overallSentiment === 'positive' ? 'bg-green-50' : 
               overallSentiment === 'negative' ? 'bg-red-50' : 'bg-yellow-50',
      description: 'Dominant sentiment across all questions'
    },
    {
      title: 'Positive Responses',
      value: sentimentStats.positive,
      percentage: totalQuestions > 0 ? Math.round((sentimentStats.positive / totalQuestions) * 100) : 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Questions with positive feedback trends'
    },
    {
      title: 'Negative Responses',
      value: sentimentStats.negative,
      percentage: totalQuestions > 0 ? Math.round((sentimentStats.negative / totalQuestions) * 100) : 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Questions requiring attention'
    },
    {
      title: 'Neutral Responses',
      value: sentimentStats.neutral,
      percentage: totalQuestions > 0 ? Math.round((sentimentStats.neutral / totalQuestions) * 100) : 0,
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Balanced or mixed sentiment'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sentimentMetrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              {metric.percentage !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {metric.percentage}%
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
              <div className={`text-2xl font-bold mb-1 ${metric.color}`}>
                {typeof metric.value === 'string' ? metric.value : metric.value}
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
