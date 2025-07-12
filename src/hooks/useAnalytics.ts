
import { useState, useEffect } from 'react';
import { FeedbackResponse } from '@/components/FeedbackForm';
import { generateInsights, calculateEngagementScore, AnalyticsData } from '@/services/analyticsService';

export const useAnalytics = (
  responses: Record<string, any>,
  totalQuestions: number,
  finalResponses: FeedbackResponse[]
) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  const trackQuestionStart = () => {
    setQuestionStartTime(Date.now());
  };

  const trackQuestionResponse = () => {
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    setResponseTimes(prev => [...prev, responseTime]);
  };

  const getAverageResponseTime = () => {
    return responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 30;
  };

  const getEstimatedTimeRemaining = (currentIndex: number) => {
    const avgTime = getAverageResponseTime();
    const remainingQuestions = totalQuestions - currentIndex;
    return remainingQuestions * avgTime;
  };

  useEffect(() => {
    if (finalResponses.length > 0) {
      const insights = generateInsights(finalResponses);
      setAnalytics(insights);
    }
  }, [finalResponses]);

  return {
    analytics,
    trackQuestionStart,
    trackQuestionResponse,
    getAverageResponseTime,
    getEstimatedTimeRemaining,
    engagementScore: calculateEngagementScore(responses, totalQuestions)
  };
};
