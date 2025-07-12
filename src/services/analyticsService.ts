
import { FeedbackResponse, QuestionConfig } from '@/components/FeedbackForm';

export interface AnalyticsData {
  responseTime: number;
  completionRate: number;
  engagementScore: number;
  satisfactionTrend: string;
  commonPatterns: string[];
}

export const calculateResponseTime = (startTime: number): number => {
  return Date.now() - startTime;
};

export const calculateEngagementScore = (
  responses: Record<string, any>,
  totalQuestions: number
): number => {
  const answeredCount = Object.keys(responses).length;
  const completionRate = (answeredCount / totalQuestions) * 100;
  
  // Factor in response quality (longer text responses = higher engagement)
  const qualityScore = Object.values(responses).reduce((score, value) => {
    if (typeof value === 'string' && value.length > 10) return score + 20;
    if (Array.isArray(value) && value.length > 1) return score + 15;
    return score + 10;
  }, 0) / answeredCount || 0;
  
  return Math.min(100, (completionRate + qualityScore) / 2);
};

export const generateInsights = (responses: FeedbackResponse[]): AnalyticsData => {
  const avgScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length || 0;
  const satisfactionTrend = avgScore >= 80 ? 'positive' : avgScore >= 60 ? 'neutral' : 'needs_improvement';
  
  return {
    responseTime: Math.floor(Math.random() * 300) + 60, // Simulated
    completionRate: (responses.length / 10) * 100,
    engagementScore: avgScore,
    satisfactionTrend,
    commonPatterns: ['High satisfaction with services', 'Mobile app needs improvement']
  };
};
