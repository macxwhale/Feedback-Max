
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SentimentAnalysis {
  overall: {
    score: number;
    label: string;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  insights: {
    topTheme: string;
    improvementArea: string;
    totalAnalyzed: number;
  };
  themes: Array<{
    word: string;
    count: number;
    frequency: number;
  }>;
  byCategory: Array<{
    name: string;
    totalResponses: number;
    sentimentScore: number;
    sentimentLabel: string;
  }>;
}

export const useSentimentAnalysis = (organizationId: string) => {
  return useQuery({
    queryKey: ['sentiment-analysis', organizationId],
    queryFn: async (): Promise<SentimentAnalysis> => {
      // Get responses with text and scores
      const { data: responses } = await supabase
        .from('feedback_responses')
        .select(`
          id,
          score,
          response_value,
          question_category,
          created_at
        `)
        .eq('organization_id', organizationId);

      if (!responses || responses.length === 0) {
        return {
          overall: {
            score: 0,
            label: 'No data',
            trend: { value: 0, isPositive: true }
          },
          distribution: { positive: 0, neutral: 0, negative: 0 },
          insights: {
            topTheme: 'No themes identified',
            improvementArea: 'Collect more feedback',
            totalAnalyzed: 0
          },
          themes: [],
          byCategory: []
        };
      }

      // Calculate sentiment based on scores
      const validResponses = responses.filter(r => r.score !== null);
      const positiveCount = validResponses.filter(r => r.score >= 4).length;
      const neutralCount = validResponses.filter(r => r.score === 3).length;
      const negativeCount = validResponses.filter(r => r.score <= 2).length;

      const totalValid = validResponses.length;
      const positivePercent = totalValid > 0 ? Math.round((positiveCount / totalValid) * 100) : 0;
      const neutralPercent = totalValid > 0 ? Math.round((neutralCount / totalValid) * 100) : 0;
      const negativePercent = totalValid > 0 ? Math.round((negativeCount / totalValid) * 100) : 0;

      const overallScore = positivePercent;
      const overallLabel = overallScore >= 70 ? 'Positive' : 
                          overallScore >= 50 ? 'Neutral' : 'Negative';

      // Analyze text responses for themes (simplified)
      const textResponses = responses
        .filter(r => r.response_value && typeof r.response_value === 'string')
        .map(r => r.response_value as string)
        .join(' ')
        .toLowerCase();

      // Simple word frequency analysis
      const commonWords = ['good', 'great', 'excellent', 'poor', 'bad', 'slow', 'fast', 'easy', 'difficult', 'helpful'];
      const themes = commonWords
        .map(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = textResponses.match(regex) || [];
          return {
            word: word.charAt(0).toUpperCase() + word.slice(1),
            count: matches.length,
            frequency: matches.length
          };
        })
        .filter(theme => theme.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Calculate sentiment by category
      const categories = [...new Set(responses.map(r => r.question_category))];
      const byCategory = categories.map(category => {
        const categoryResponses = validResponses.filter(r => r.question_category === category);
        const categoryPositive = categoryResponses.filter(r => r.score >= 4).length;
        const sentimentScore = categoryResponses.length > 0 
          ? Math.round((categoryPositive / categoryResponses.length) * 100)
          : 0;

        return {
          name: category,
          totalResponses: categoryResponses.length,
          sentimentScore,
          sentimentLabel: sentimentScore >= 70 ? 'Positive' : 
                         sentimentScore >= 50 ? 'Neutral' : 'Negative'
        };
      });

      // Calculate trend (simplified)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentResponses = validResponses.filter(r => 
        new Date(r.created_at) >= thirtyDaysAgo
      );
      const olderResponses = validResponses.filter(r => 
        new Date(r.created_at) < thirtyDaysAgo
      );

      const recentPositive = recentResponses.filter(r => r.score >= 4).length;
      const olderPositive = olderResponses.filter(r => r.score >= 4).length;

      const recentPercent = recentResponses.length > 0 ? (recentPositive / recentResponses.length) * 100 : 0;
      const olderPercent = olderResponses.length > 0 ? (olderPositive / olderResponses.length) * 100 : recentPercent;

      const trendValue = olderPercent > 0 ? Math.round(((recentPercent - olderPercent) / olderPercent) * 100) : 0;

      return {
        overall: {
          score: overallScore,
          label: overallLabel,
          trend: {
            value: Math.abs(trendValue),
            isPositive: trendValue >= 0
          }
        },
        distribution: {
          positive: positivePercent,
          neutral: neutralPercent,
          negative: negativePercent
        },
        insights: {
          topTheme: themes.length > 0 ? themes[0].word : 'Service quality',
          improvementArea: negativePercent > 20 ? 'Response time' : 'Overall satisfaction',
          totalAnalyzed: totalValid
        },
        themes,
        byCategory
      };
    },
    enabled: !!organizationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
