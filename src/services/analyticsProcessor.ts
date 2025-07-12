import { processResponsesByType } from '@/services/responseDataProcessor';
import {
  QuestionAnalytics,
  CategoryAnalytics,
  TrendDataPoint,
} from '@/types/analytics';

type Question = {
  id: string;
  question_text: string;
  question_type: string | null;
  category: string | null;
};
type FeedbackResponse = {
    id: string;
    question_id: string;
    response_value: any;
    question_category: string | null;
    session_id: string;
    created_at: string;
    score: number | null;
};
type FeedbackSession = {
  id: string;
  status: string;
  created_at: string;
  total_score: number | null;
};

const determineTrend = (
  questionType: string | null, 
  distribution: Record<string, number>,
  totalResponses: number
): 'positive' | 'neutral' | 'negative' | 'mixed' => {
  if (totalResponses === 0) return 'neutral';
  
  switch (questionType?.toLowerCase()) {
    case 'star rating': {
      const entries = Object.entries(distribution);
      const highRatings = entries.filter(([rating]) => parseInt(rating) >= 4)
        .reduce((sum, [, count]) => sum + count, 0);
      const highPercentage = (highRatings / totalResponses) * 100;
      
      if (highPercentage > 60) return 'positive';
      if (highPercentage < 30) return 'negative';
      return 'mixed';
    }
    
    case 'nps score': {
      let promoters = 0, detractors = 0;
      Object.entries(distribution).forEach(([score, count]) => {
        const numScore = parseInt(score) || 0;
        if (numScore >= 9) promoters += count;
        else if (numScore <= 6) detractors += count;
      });
      
      const nps = totalResponses > 0 ? ((promoters - detractors) / totalResponses) * 100 : 0;
      if (nps > 20) return 'positive';
      if (nps < -20) return 'negative';
      return 'mixed';
    }
    
    case 'likert scale': {
      let agreement = 0;
      Object.entries(distribution).forEach(([response, count]) => {
        if (response.toLowerCase().includes('agree') && !response.toLowerCase().includes('disagree')) {
          agreement += count;
        }
      });
      
      const agreementRate = (agreement / totalResponses) * 100;
      if (agreementRate > 60) return 'positive';
      if (agreementRate < 30) return 'negative';
      return 'mixed';
    }
    
    default:
      return 'neutral';
  }
};

export const processAnalyticsData = (
  questions: Question[] | null,
  responses: FeedbackResponse[] | null,
  sessions: FeedbackSession[] | null
): {
  questions: QuestionAnalytics[];
  categories: CategoryAnalytics[];
  trendData: TrendDataPoint[];
} => {
    const totalSessions = sessions?.length || 0;
    
    // Process individual question analytics
    const questionAnalytics: QuestionAnalytics[] = [];
    const categoryMap = new Map<string, CategoryAnalytics>();

    if (questions) {
        for (const question of questions) {
            const questionResponses = responses?.filter(r => r.question_id === question.id) || [];
            const uniqueSessions = new Set(questionResponses.map(r => r.session_id));
            
            const scoredResponses = questionResponses.filter(r => typeof r.score === 'number');
            const totalScore = scoredResponses.reduce((sum, r) => sum + (r.score as number), 0);
            const avgScore = scoredResponses.length > 0 ? totalScore / scoredResponses.length : 0;

            const processedData = processResponsesByType(
                question.question_type || 'text',
                questionResponses,
                totalSessions
            );

            const trend = determineTrend(question.question_type, processedData.distribution, questionResponses.length);

            const questionCompletionRate = totalSessions > 0 
                ? (uniqueSessions.size / totalSessions) * 100 
                : 0;

            const questionAnalytic: QuestionAnalytics = {
                id: question.id,
                question_text: question.question_text,
                question_type: question.question_type || 'text',
                category: question.category || 'General',
                total_responses: questionResponses.length,
                completion_rate: Math.round(questionCompletionRate),
                avg_score: avgScore,
                response_distribution: processedData.distribution,
                insights: processedData.insights,
                trend
            };

            questionAnalytics.push(questionAnalytic);

            const categoryKey = question.category || 'General';
            if (!categoryMap.has(categoryKey)) {
                categoryMap.set(categoryKey, {
                    category: categoryKey,
                    total_questions: 0,
                    total_responses: 0,
                    completion_rate: 0,
                    questions: [],
                    avg_score: 0,
                });
            }

            const categoryData = categoryMap.get(categoryKey)!;
            categoryData.total_questions += 1;
            categoryData.total_responses += questionResponses.length;
            categoryData.questions.push(questionAnalytic);
        }
    }

    // Calculate category averages
    const categoryAnalytics: CategoryAnalytics[] = [];
    categoryMap.forEach(category => {
        const avgCompletionRate = category.questions.length > 0
            ? category.questions.reduce((sum, q) => sum + q.completion_rate, 0) / category.questions.length
            : 0;
        
        const scoredQuestions = category.questions.filter(q => q.avg_score > 0);
        const avgCategoryScore = scoredQuestions.length > 0
            ? scoredQuestions.reduce((sum, q) => sum + q.avg_score, 0) / scoredQuestions.length
            : 0;

        category.completion_rate = Math.round(avgCompletionRate);
        category.avg_score = avgCategoryScore;
        categoryAnalytics.push(category);
    });

    // Process trend data
    const trendData: TrendDataPoint[] = [];
    if (sessions) {
        const sessionsByDate = sessions.reduce((acc, session) => {
            const date = new Date(session.created_at).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, total_sessions: 0, completed_sessions: 0, scores: [] };
            }
            acc[date].total_sessions++;
            if (session.status === 'completed') {
                acc[date].completed_sessions++;
            }
            if (typeof session.total_score === 'number') {
                acc[date].scores.push(session.total_score);
            }
            return acc;
        }, {} as Record<string, { date: string; total_sessions: number; completed_sessions: number; scores: number[] }>);

        const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        for (const date of sortedDates) {
            const dayData = sessionsByDate[date];
            const totalScore = dayData.scores.reduce((sum, score) => sum + score, 0);
            const avgScore = dayData.scores.length > 0 ? totalScore / dayData.scores.length : 0;
            const completionRate = dayData.total_sessions > 0 ? (dayData.completed_sessions / dayData.total_sessions) * 100 : 0;

            trendData.push({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total_sessions: dayData.total_sessions,
                completed_sessions: dayData.completed_sessions,
                completion_rate: Math.round(completionRate),
                avg_score: Math.round(avgScore),
            });
        }
    }

    return {
        questions: questionAnalytics,
        categories: categoryAnalytics,
        trendData,
    };
};
