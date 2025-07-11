
import { QuestionAnalytics } from '@/types/analytics';

export const analyzeQuestionPerformance = (questions: QuestionAnalytics[]) => {
  if (!questions || questions.length === 0) {
    return {
      topPerformers: [],
      lowPerformers: [],
      completionTrends: [],
    };
  }

  // Sort by response time - fastest first
  const sortedByResponseTime = [...questions]
    .filter(q => q.avg_response_time_ms && q.avg_response_time_ms > 0)
    .sort((a, b) => (a.avg_response_time_ms || 0) - (b.avg_response_time_ms || 0));

  // Top performers: fastest 5 questions
  const topPerformers = sortedByResponseTime.slice(0, 5).map(q => ({
    question_text: q.question_text,
    avg_score: q.avg_score,
    total_responses: q.total_responses,
    completion_rate: q.completion_rate,
    avg_response_time_ms: q.avg_response_time_ms
  }));

  // Low performers: slowest 5 questions (but only if they're actually slow)
  const slowQuestions = sortedByResponseTime.filter(q => (q.avg_response_time_ms || 0) > 15000); // More than 15 seconds
  const lowPerformers = slowQuestions.slice(-5).reverse().map(q => ({
    question_text: q.question_text,
    avg_score: q.avg_score,
    total_responses: q.total_responses,
    completion_rate: q.completion_rate,
    avg_response_time_ms: q.avg_response_time_ms
  }));

  // Completion trends: sorted by completion rate
  const completionTrends = [...questions]
    .sort((a, b) => b.completion_rate - a.completion_rate)
    .map(q => ({
      question_text: q.question_text,
      completion_rate: q.completion_rate,
      total_responses: q.total_responses
    }));

  return {
    topPerformers,
    lowPerformers,
    completionTrends,
  };
};

export const calculatePerformanceInsights = (questions: QuestionAnalytics[], summary: any) => {
  if (!questions || questions.length === 0) {
    return {
      fastRespondingQuestions: 0,
      slowRespondingQuestions: 0,
      avgCompletionRate: 0,
      totalResponses: 0,
      avgResponseTime: 0,
    };
  }

  // Define thresholds based on realistic expectations
  const fastThreshold = 10000; // 10 seconds
  const slowThreshold = 30000; // 30 seconds

  const questionsWithResponseTime = questions.filter(q => q.avg_response_time_ms && q.avg_response_time_ms > 0);
  
  const fastRespondingQuestions = questionsWithResponseTime.filter(
    q => (q.avg_response_time_ms || 0) <= fastThreshold
  ).length;
  
  const slowRespondingQuestions = questionsWithResponseTime.filter(
    q => (q.avg_response_time_ms || 0) >= slowThreshold
  ).length;

  const totalResponses = questions.reduce((sum, q) => sum + q.total_responses, 0);
  const avgCompletionRate = questions.length > 0 
    ? questions.reduce((sum, q) => sum + q.completion_rate, 0) / questions.length 
    : 0;

  const avgResponseTime = questionsWithResponseTime.length > 0
    ? questionsWithResponseTime.reduce((sum, q) => sum + (q.avg_response_time_ms || 0), 0) / questionsWithResponseTime.length
    : 0;

  return {
    fastRespondingQuestions,
    slowRespondingQuestions,
    avgCompletionRate: Math.round(avgCompletionRate),
    totalResponses,
    avgResponseTime: Math.round(avgResponseTime),
  };
};

export const getResponseTimeColor = (responseTime: number) => {
  if (responseTime <= 10000) return 'text-green-600'; // <= 10 seconds
  if (responseTime <= 20000) return 'text-yellow-600'; // <= 20 seconds
  return 'text-red-600'; // > 20 seconds
};

export const getCompletionColor = (completionRate: number) => {
  if (completionRate >= 80) return 'text-green-600';
  if (completionRate >= 60) return 'text-yellow-600';
  return 'text-red-600';
};
