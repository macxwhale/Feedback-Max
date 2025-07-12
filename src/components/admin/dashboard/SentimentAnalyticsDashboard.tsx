import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { Brain } from 'lucide-react';
import { SentimentOverviewCards } from './sentiment/SentimentOverviewCards';
import { SentimentQuestionsList } from './sentiment/SentimentQuestionsList';
import { SentimentCategoriesList } from './sentiment/SentimentCategoriesList';
import { 
  calculateSentiment, 
  getSentimentColor, 
  aggregateSentimentStats, 
  calculateOverallSentiment 
} from './sentiment/sentimentUtils';
import type { QuestionAnalytics } from '@/types/analytics';

interface SentimentAnalyticsDashboardProps {
  organizationId: string;
}

export const SentimentAnalyticsDashboard: React.FC<SentimentAnalyticsDashboardProps> = ({
  organizationId
}) => {
  const { data: analyticsData, isLoading } = useAnalyticsTableData(organizationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No sentiment data available</p>
        </CardContent>
      </Card>
    );
  }

  // Analyze sentiment by question trend instead of score
  const questionSentiments = analyticsData.questions.map((question: QuestionAnalytics) => {
    const sentiment = question.trend === 'positive' ? 'positive' : 
                    question.trend === 'negative' ? 'negative' : 'neutral';
    return {
      ...question,
      sentiment,
    };
  });

  // Aggregate sentiment stats
  const sentimentStats = aggregateSentimentStats(questionSentiments);
  const totalQuestions = questionSentiments.length;
  const overallSentiment = calculateOverallSentiment(sentimentStats);

  // Category sentiment analysis based on question trends
  const categorySentiments = analyticsData.categories.map(category => {
    const positiveQuestions = category.questions.filter(q => q.trend === 'positive').length;
    const totalCategoryQuestions = category.questions.length;
    const positiveRate = totalCategoryQuestions > 0 ? positiveQuestions / totalCategoryQuestions : 0;
    
    const sentiment = positiveRate > 0.6 ? 'positive' : 
                     positiveRate < 0.3 ? 'negative' : 'neutral';
    
    return {
      ...category,
      sentiment
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
        <Badge className={getSentimentColor(overallSentiment)}>
          Overall: {overallSentiment}
        </Badge>
      </div>

      {/* Sentiment Overview */}
      <SentimentOverviewCards
        sentimentStats={sentimentStats}
        totalQuestions={totalQuestions}
        overallScore={0}
      />

      {/* Detailed Analysis */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="questions">By Question</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <SentimentQuestionsList questionSentiments={questionSentiments.map(q => ({
            question_text: q.question_text,
            sentiment: q.sentiment,
            total_responses: q.total_responses,
            completion_rate: q.completion_rate
          }))} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <SentimentCategoriesList categorySentiments={categorySentiments.map(c => ({
            category: c.category,
            sentiment: c.sentiment,
            total_questions: c.total_questions,
            total_responses: c.total_responses
          }))} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
