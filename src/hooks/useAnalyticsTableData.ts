import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsTableData, QuestionAnalytics, CategoryAnalytics, TrendDataPoint } from '@/types/analytics';
import { 
  calculateSafePercentageChange, 
  calculateSafeGrowthRate, 
  normalizeScore, 
  validateSessionData 
} from '@/utils/metricCalculations';

export const useAnalyticsTableData = (organizationId: string) => {
  return useQuery({
    queryKey: ['analytics-table-data', organizationId],
    queryFn: async (): Promise<AnalyticsTableData> => {
      console.log('Fetching analytics data for organization:', organizationId);

      // Fetch questions with analytics data
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          question_type,
          category,
          is_active,
          created_at
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      // Fetch responses data with proper filtering
      const { data: responsesData, error: responsesError } = await supabase
        .from('feedback_responses')
        .select(`
          id,
          question_id,
          score,
          response_time_ms,
          created_at,
          question_category,
          session_id,
          response_value
        `)
        .eq('organization_id', organizationId);

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
        throw responsesError;
      }

      // Fetch sessions data for comprehensive analytics
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('feedback_sessions')
        .select(`
          id,
          status,
          total_score,
          created_at,
          completed_at,
          started_at,
          user_id
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('Raw data fetched:', {
        questions: questionsData?.length || 0,
        responses: responsesData?.length || 0,
        sessions: sessionsData?.length || 0
      });

      // Validate and clean session data
      const cleanedSessions = validateSessionData(sessionsData || []);
      
      // Calculate accurate metrics with safe calculations
      const totalSessions = cleanedSessions.length;
      const completedSessions = cleanedSessions.filter(s => s.status === 'completed').length;
      const inProgressSessions = cleanedSessions.filter(s => s.status === 'in_progress').length;
      const abandonedSessions = totalSessions - completedSessions - inProgressSessions;

      // Calculate completion rate accurately
      const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      // Calculate average session score with normalization
      const completedSessionsWithScores = cleanedSessions.filter(s => 
        s.status === 'completed' && s.total_score !== null
      );
      
      const normalizedScores = completedSessionsWithScores.map(s => normalizeScore(s.total_score));
      const avgSessionScore = normalizedScores.length > 0 
        ? normalizedScores.reduce((sum, score) => sum + score, 0) / normalizedScores.length 
        : 0;

      // Calculate user satisfaction based on normalized scores (4+ out of 5 is satisfied)
      const highSatisfactionSessions = normalizedScores.filter(score => score >= 4).length;
      const userSatisfactionRate = normalizedScores.length > 0 
        ? Math.round((highSatisfactionSessions / normalizedScores.length) * 100) 
        : 0;

      // Calculate growth metrics with safe thresholds
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const currentPeriodSessions = cleanedSessions.filter(s => 
        new Date(s.created_at) >= thirtyDaysAgo
      ).length;
      const previousPeriodSessions = cleanedSessions.filter(s => 
        new Date(s.created_at) >= sixtyDaysAgo && new Date(s.created_at) < thirtyDaysAgo
      ).length;

      // Use safe growth rate calculation
      const growthRate = calculateSafeGrowthRate(currentPeriodSessions, previousPeriodSessions);

      // Process questions analytics
      const questions: QuestionAnalytics[] = (questionsData || []).map(question => {
        const questionResponses = (responsesData || []).filter(r => r.question_id === question.id);
        const totalResponses = questionResponses.length;
        
        // Get unique sessions that responded to this question
        const uniqueSessions = new Set(questionResponses.map(r => r.session_id));
        const questionCompletionRate = totalSessions > 0 
          ? Math.round((uniqueSessions.size / totalSessions) * 100) 
          : 0;

        // Calculate average score for this question
        const scoredResponses = questionResponses.filter(r => r.score !== null);
        const avgScore = scoredResponses.length > 0 
          ? scoredResponses.reduce((sum, r) => sum + (r.score || 0), 0) / scoredResponses.length 
          : 0;

        // Calculate average response time
        const timedResponses = questionResponses.filter(r => r.response_time_ms !== null);
        const avgResponseTime = timedResponses.length > 0 
          ? timedResponses.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / timedResponses.length 
          : 0;

        // Generate insights based on performance
        const insights: string[] = [];
        if (questionCompletionRate > 90) {
          insights.push("High engagement - users complete this question consistently");
        }
        if (questionCompletionRate < 70) {
          insights.push("Low completion - consider simplifying or repositioning");
        }
        if (avgScore > 4) {
          insights.push("Positive sentiment - high satisfaction scores");
        }
        if (avgScore < 2.5) {
          insights.push("Negative sentiment - requires attention");
        }
        if (avgResponseTime > 30000) {
          insights.push("Long response time - may indicate complexity");
        }

        return {
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type || 'text',
          category: question.category || 'General',
          total_responses: totalResponses,
          completion_rate: questionCompletionRate,
          avg_score: Math.round(avgScore * 100) / 100,
          avg_response_time_ms: Math.round(avgResponseTime),
          response_distribution: {}, // Enhanced in separate processor
          insights,
          trend: avgScore > 3.5 ? 'positive' : avgScore < 2.5 ? 'negative' : 'neutral' as 'positive' | 'negative' | 'neutral' | 'mixed'
        };
      });

      // Process categories analytics
      const categoryMap = new Map<string, QuestionAnalytics[]>();
      questions.forEach(q => {
        const category = q.category || 'General';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(q);
      });

      const categories: CategoryAnalytics[] = Array.from(categoryMap.entries()).map(([category, categoryQuestions]) => {
        const totalResponses = categoryQuestions.reduce((sum, q) => sum + q.total_responses, 0);
        const avgCompletionRate = categoryQuestions.length > 0
          ? categoryQuestions.reduce((sum, q) => sum + q.completion_rate, 0) / categoryQuestions.length
          : 0;
        const avgScore = categoryQuestions.length > 0
          ? categoryQuestions.reduce((sum, q) => sum + q.avg_score, 0) / categoryQuestions.length
          : 0;
        const avgResponseTime = categoryQuestions.length > 0
          ? categoryQuestions.reduce((sum, q) => sum + (q.avg_response_time_ms || 0), 0) / categoryQuestions.length
          : 0;

        return {
          category,
          total_questions: categoryQuestions.length,
          total_responses: totalResponses,
          completion_rate: Math.round(avgCompletionRate),
          questions: categoryQuestions,
          avg_score: Math.round(avgScore * 100) / 100,
          avg_response_time_ms: Math.round(avgResponseTime)
        };
      });

      // Generate trend data with safe calculations
      const trendData: TrendDataPoint[] = [];
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      last30Days.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const daySessions = cleanedSessions.filter(s => 
          s.created_at.startsWith(dateStr)
        );
        
        const totalSessions = daySessions.length;
        const completedSessions = daySessions.filter(s => s.status === 'completed').length;
        const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        
        // Calculate average score for the day with normalization
        const completedWithScores = daySessions.filter(s => s.status === 'completed' && s.total_score !== null);
        const dayNormalizedScores = completedWithScores.map(s => normalizeScore(s.total_score));
        const avgScore = dayNormalizedScores.length > 0 
          ? dayNormalizedScores.reduce((sum, score) => sum + score, 0) / dayNormalizedScores.length 
          : 0;

        trendData.push({
          date: dateStr,
          total_sessions: totalSessions,
          completed_sessions: completedSessions,
          completion_rate: completionRate,
          avg_score: Math.round(avgScore * 100) / 100
        });
      });

      const analyticsResult = {
        questions,
        categories,
        summary: {
          total_questions: questions.length,
          total_responses: questions.reduce((sum, q) => sum + q.total_responses, 0),
          overall_completion_rate: completionRate,
          total_sessions: totalSessions,
          completed_sessions: completedSessions,
          avg_score: Math.round(avgSessionScore * 100) / 100,
          user_satisfaction_rate: userSatisfactionRate,
          growth_rate: growthRate,
          abandoned_sessions: abandonedSessions,
          response_rate: questions.length > 0 && totalSessions > 0
            ? Math.round((questions.reduce((sum, q) => sum + q.total_responses, 0) / (questions.length * totalSessions)) * 100)
            : 0
        },
        trendData
      };

      console.log('Analytics result with safe calculations:', analyticsResult);
      return analyticsResult;
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
