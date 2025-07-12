
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboard } from '@/context/DashboardContext';
import type { QuestionAnalytics, CategoryAnalytics } from '@/types/analytics';

export const useAnalyticsData = (organizationId: string) => {
  const { dateRange } = useDashboard();

  return useQuery({
    queryKey: ['analytics-data', organizationId, dateRange],
    queryFn: async () => {
      // Get all questions for the organization
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      // Get all responses for the organization
      let responsesQuery = supabase
        .from('feedback_responses')
        .select(`
          id,
          question_id,
          response_value,
          question_category,
          session_id,
          created_at,
          score,
          response_time_ms
        `)
        .eq('organization_id', organizationId);

      if (dateRange?.from) {
        responsesQuery = responsesQuery.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        responsesQuery = responsesQuery.lt('created_at', toDate.toISOString());
      }
      const { data: responses } = await responsesQuery;

      // Get all sessions for completion rate calculation
      let sessionsQuery = supabase
        .from('feedback_sessions')
        .select('id, status, created_at, total_score')
        .eq('organization_id', organizationId);

      if (dateRange?.from) {
        sessionsQuery = sessionsQuery.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        sessionsQuery = sessionsQuery.lt('created_at', toDate.toISOString());
      }
      const { data: sessions } = await sessionsQuery;

      // Process data into analytics format
      const processedQuestions: QuestionAnalytics[] = (questions || []).map(question => {
        const questionResponses = (responses || []).filter(r => r.question_id === question.id);
        const totalResponses = questionResponses.length;
        const completionRate = sessions && sessions.length > 0 
          ? Math.round((totalResponses / sessions.length) * 100) 
          : 0;

        // Calculate response distribution
        const responseDistribution: Record<string, number> = {};
        questionResponses.forEach(response => {
          const value = JSON.stringify(response.response_value);
          responseDistribution[value] = (responseDistribution[value] || 0) + 1;
        });

        // Generate insights based on data
        const insights: string[] = [];
        if (completionRate > 80) {
          insights.push('High completion rate indicates good user engagement');
        } else if (completionRate < 50) {
          insights.push('Low completion rate may indicate question complexity');
        }
        
        if (totalResponses > 0) {
          const avgScore = questionResponses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses;
          if (avgScore > 8) {
            insights.push('High satisfaction scores');
          } else if (avgScore < 5) {
            insights.push('Low satisfaction scores need attention');
          }
        }

        // Determine trend
        let trend: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
        if (completionRate > 70 && insights.some(i => i.includes('High'))) {
          trend = 'positive';
        } else if (completionRate < 50 || insights.some(i => i.includes('Low'))) {
          trend = 'negative';
        } else if (insights.length > 1) {
          trend = 'mixed';
        }

        return {
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type || 'text',
          category: question.category || 'General',
          total_responses: totalResponses,
          completion_rate: completionRate,
          avg_score: questionResponses.reduce((sum, r) => sum + (r.score || 0), 0) / (totalResponses || 1),
          response_distribution: responseDistribution,
          insights,
          trend
        };
      });

      // Process categories
      const categoryMap = new Map<string, CategoryAnalytics>();
      processedQuestions.forEach(question => {
        const category = question.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            total_questions: 0,
            total_responses: 0,
            completion_rate: 0,
            questions: [],
            avg_score: 0
          });
        }
        
        const categoryData = categoryMap.get(category)!;
        categoryData.total_questions += 1;
        categoryData.total_responses += question.total_responses;
        categoryData.questions.push(question);
      });

      // Calculate category averages
      const processedCategories: CategoryAnalytics[] = Array.from(categoryMap.values()).map(category => ({
        ...category,
        completion_rate: category.questions.length > 0 
          ? Math.round(category.questions.reduce((sum, q) => sum + q.completion_rate, 0) / category.questions.length)
          : 0,
        avg_score: category.questions.length > 0
          ? category.questions.reduce((sum, q) => sum + q.avg_score, 0) / category.questions.length
          : 0
      }));

      return {
        questions: processedQuestions,
        categories: processedCategories,
        summary: {
          total_questions: processedQuestions.length,
          total_responses: processedQuestions.reduce((sum, q) => sum + q.total_responses, 0),
          overall_completion_rate: processedCategories.length > 0
            ? Math.round(processedCategories.reduce((sum, c) => sum + c.completion_rate, 0) / processedCategories.length)
            : 0,
          overall_avg_score: processedQuestions.length > 0
            ? processedQuestions.reduce((sum, q) => sum + q.avg_score, 0) / processedQuestions.length
            : 0
        }
      };
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
