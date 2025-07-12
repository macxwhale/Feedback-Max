import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { BarChart3 } from 'lucide-react';
import { PerformanceOverviewCards } from './performance/PerformanceOverviewCards';
import { TopPerformersTab } from './performance/TopPerformersTab';
import { LowPerformersTab } from './performance/LowPerformersTab';
import { CompletionAnalysisTab } from './performance/CompletionAnalysisTab';
import { CategoryPerformanceTab } from './performance/CategoryPerformanceTab';
import { analyzeQuestionPerformance, calculatePerformanceInsights } from './performance/performanceUtils';
import type { QuestionAnalytics, CategoryAnalytics } from '@/types/analytics';

interface PerformanceAnalyticsDashboardProps {
  organizationId: string;
}

export const PerformanceAnalyticsDashboard: React.FC<PerformanceAnalyticsDashboardProps> = ({
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
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No performance data available</p>
        </CardContent>
      </Card>
    );
  }

  // Analyze question performance using utility function
  const { topPerformers, lowPerformers, completionTrends } = analyzeQuestionPerformance(analyticsData.questions);

  // Calculate performance metrics using utility function
  const performanceInsights = calculatePerformanceInsights(analyticsData.questions, analyticsData.summary);

  // Category performance analysis based on response times
  const categoryPerformance = [...analyticsData.categories]
    .sort((a, b) => (a.avg_response_time_ms || 0) - (b.avg_response_time_ms || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <Badge variant="outline">
          {analyticsData.summary.total_questions} questions analyzed
        </Badge>
      </div>

      {/* Performance Overview */}
      <PerformanceOverviewCards 
        performanceInsights={performanceInsights}
        totalQuestions={analyticsData.summary.total_questions}
      />

      {/* Detailed Performance Analysis */}
      <Tabs defaultValue="top-performers" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          <TabsTrigger value="low-performers">Need Attention</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="top-performers" className="space-y-4">
          <TopPerformersTab topPerformers={topPerformers} />
        </TabsContent>

        <TabsContent value="low-performers" className="space-y-4">
          <LowPerformersTab lowPerformers={lowPerformers} />
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <CompletionAnalysisTab completionTrends={completionTrends} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryPerformanceTab categoryPerformance={categoryPerformance.map(c => ({
            category: c.category,
            avg_score: c.avg_score,
            total_questions: c.total_questions,
            total_responses: c.total_responses,
            completion_rate: c.completion_rate,
            avg_response_time_ms: c.avg_response_time_ms
          }))} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
