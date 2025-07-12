
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { FeedbackResponse } from '../FeedbackForm';
import { analyzeSentiment } from '@/services/customerInsightsService';

interface SentimentTrendsProps {
  responses: FeedbackResponse[];
}

export const SentimentTrends: React.FC<SentimentTrendsProps> = ({ responses }) => {
  // Analyze sentiment for text responses
  const textResponses = responses.filter(r => typeof r.value === 'string');
  const sentimentAnalysis = textResponses.map(response => ({
    ...response,
    sentiment: analyzeSentiment(response.value as string)
  }));

  const positiveFeedback = sentimentAnalysis.filter(r => r.sentiment.overall === 'positive');
  const negativeFeedback = sentimentAnalysis.filter(r => r.sentiment.overall === 'negative');
  const neutralFeedback = sentimentAnalysis.filter(r => r.sentiment.overall === 'neutral');

  const overallSentiment = sentimentAnalysis.length > 0 
    ? sentimentAnalysis.reduce((sum, r) => sum + r.sentiment.score, 0) / sentimentAnalysis.length 
    : 0;

  // Extract common themes
  const allThemes = sentimentAnalysis.flatMap(r => r.sentiment.themes);
  const themeFrequency = allThemes.reduce((acc, theme) => {
    acc[theme.theme] = (acc[theme.theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topThemes = Object.entries(themeFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score < -0.2) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-yellow-600" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'bg-green-100 text-green-800';
    if (score < -0.2) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.2) return 'Positive';
    if (score < -0.2) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSentimentIcon(overallSentiment)}
            Overall Customer Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getSentimentIcon(overallSentiment)}
                <Badge className={getSentimentColor(overallSentiment)}>
                  {getSentimentLabel(overallSentiment)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{Math.round((overallSentiment + 1) * 50)}%</p>
              <p className="text-sm text-gray-600">Sentiment Score</p>
            </div>

            <div className="text-center">
              <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{positiveFeedback.length}</p>
              <p className="text-sm text-gray-600">Positive Reviews</p>
            </div>

            <div className="text-center">
              <ThumbsDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{negativeFeedback.length}</p>
              <p className="text-sm text-gray-600">Negative Reviews</p>
            </div>

            <div className="text-center">
              <Minus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{neutralFeedback.length}</p>
              <p className="text-sm text-gray-600">Neutral Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Most Discussed Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topThemes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Not enough text feedback to analyze themes.
              </p>
            ) : (
              topThemes.map(([theme, count], index) => (
                <div key={theme} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{theme}</span>
                  </div>
                  <Badge variant="outline">{count} mentions</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Positive Highlights */}
            {positiveFeedback.slice(0, 2).map((feedback, index) => (
              <div key={`positive-${index}`} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Positive</Badge>
                </div>
                <p className="text-sm text-gray-700">"{String(feedback.value)}"</p>
              </div>
            ))}

            {/* Negative Highlights */}
            {negativeFeedback.slice(0, 2).map((feedback, index) => (
              <div key={`negative-${index}`} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                </div>
                <p className="text-sm text-gray-700">"{String(feedback.value)}"</p>
              </div>
            ))}

            {sentimentAnalysis.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No text feedback available for sentiment analysis.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
