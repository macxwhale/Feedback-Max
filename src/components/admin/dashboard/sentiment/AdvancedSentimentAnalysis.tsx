
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';

interface AdvancedSentimentAnalysisProps {
  organizationId: string;
}

export const AdvancedSentimentAnalysis: React.FC<AdvancedSentimentAnalysisProps> = ({
  organizationId
}) => {
  const { data: sentiment, isLoading, error } = useSentimentAnalysis(organizationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !sentiment) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No sentiment data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Overall Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-600">
                {sentiment.overall.score}%
              </div>
              <div className="text-sm text-gray-600">
                {sentiment.overall.label}
              </div>
              <Badge variant={sentiment.overall.trend.isPositive ? "default" : "destructive"}>
                {sentiment.overall.trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {sentiment.overall.trend.value}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Positive</span>
                <span className="text-green-600 font-semibold">
                  {sentiment.distribution.positive}%
                </span>
              </div>
              <Progress value={sentiment.distribution.positive} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Neutral</span>
                <span className="text-yellow-600 font-semibold">
                  {sentiment.distribution.neutral}%
                </span>
              </div>
              <Progress value={sentiment.distribution.neutral} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Negative</span>
                <span className="text-red-600 font-semibold">
                  {sentiment.distribution.negative}%
                </span>
              </div>
              <Progress value={sentiment.distribution.negative} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Top Theme:</span>
                <div className="text-gray-600 mt-1">
                  {sentiment.insights.topTheme}
                </div>
              </div>
              <div className="text-sm">
                <span className="font-medium">Improvement Area:</span>
                <div className="text-gray-600 mt-1">
                  {sentiment.insights.improvementArea}
                </div>
              </div>
              <div className="text-sm">
                <span className="font-medium">Response Volume:</span>
                <div className="text-gray-600 mt-1">
                  {sentiment.insights.totalAnalyzed} responses analyzed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Cloud Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Most Mentioned Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sentiment.themes.map((theme, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-lg text-center"
                style={{
                  fontSize: `${Math.max(0.8, Math.min(1.5, theme.frequency / 10))}rem`
                }}
              >
                <div className="font-medium text-gray-800">{theme.word}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {theme.count} mentions
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentiment.byCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-600">
                    {category.totalResponses} responses
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {category.sentimentScore}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.sentimentLabel}
                    </div>
                  </div>
                  <Badge 
                    variant={category.sentimentScore >= 70 ? "default" : "destructive"}
                    className="ml-2"
                  >
                    {category.sentimentScore >= 70 ? "Positive" : "Needs Attention"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
