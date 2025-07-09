
import type { QuestionAnalytics } from '@/types/analytics';

export const analyzeQuestionPerformance = (questions: QuestionAnalytics[]) => {
  // Sort by response time (faster = better performance)
  const sortedByResponseTime = [...questions].sort((a, b) => 
    (a.avg_response_time_ms || Infinity) - (b.avg_response_time_ms || Infinity)
  );

  const topPerformers = sortedByResponseTime.slice(0, 5).filter(q => q.avg_response_time_ms);
  const lowPerformers = sortedByResponseTime.slice(-5).filter(q => q.avg_response_time_ms);

  // Sort by completion rate for completion trends
  const completionTrends = [...questions]
    .sort((a, b) => (b.completion_rate || 0) - (a.completion_rate || 0))
    .slice(0, 10);

  return {
    topPerformers,
    lowPerformers,
    completionTrends
  };
};

export const calculatePerformanceInsights = (questions: QuestionAnalytics[], summary: any) => {
  const questionsWithResponseTime = questions.filter(q => q.avg_response_time_ms);
  
  const fastRespondingQuestions = questionsWithResponseTime.filter(q => 
    (q.avg_response_time_ms || 0) < 3000 // Less than 3 seconds
  ).length;

  const slowRespondingQuestions = questionsWithResponseTime.filter(q => 
    (q.avg_response_time_ms || 0) > 10000 // More than 10 seconds
  ).length;

  const avgCompletionRate = questions.length > 0 
    ? questions.reduce((sum, q) => sum + (q.completion_rate || 0), 0) / questions.length
    : 0;

  const avgResponseTime = questionsWithResponseTime.length > 0
    ? questionsWithResponseTime.reduce((sum, q) => sum + (q.avg_response_time_ms || 0), 0) / questionsWithResponseTime.length
    : 0;

  return {
    fastRespondingQuestions,
    slowRespondingQuestions,
    avgCompletionRate,
    totalResponses: summary.total_responses || 0,
    avgResponseTime
  };
};

export const getResponseTimeColor = (responseTime: number) => {
  if (responseTime < 3000) return 'text-green-600';
  if (responseTime < 7000) return 'text-yellow-600';
  return 'text-red-600';
};

export const getCompletionColor = (completionRate: number) => {
  if (completionRate >= 80) return 'text-green-600';
  if (completionRate >= 60) return 'text-yellow-600';
  return 'text-red-600';
};
