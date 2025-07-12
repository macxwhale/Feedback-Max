
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StrategicKPIs {
  nps: {
    score: number;
    breakdown: {
      promoters: number;
      passives: number;
      detractors: number;
    };
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  csat: {
    score: number;
    totalResponses: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
  ces: {
    score: number;
    trend: {
      value: number;
      isPositive: boolean;
    };
  };
}

export const useStrategicKPIs = (organizationId: string) => {
  return useQuery({
    queryKey: ['strategic-kpis', organizationId],
    queryFn: async (): Promise<StrategicKPIs> => {
      // Get feedback responses with scores
      const { data: responses } = await supabase
        .from('feedback_responses')
        .select('score, created_at, question_type_snapshot')
        .eq('organization_id', organizationId)
        .not('score', 'is', null);

      if (!responses || responses.length === 0) {
        return {
          nps: {
            score: 0,
            breakdown: { promoters: 0, passives: 0, detractors: 0 },
            trend: { value: 0, isPositive: true }
          },
          csat: {
            score: 0,
            totalResponses: 0,
            trend: { value: 0, isPositive: true }
          },
          ces: {
            score: 0,
            trend: { value: 0, isPositive: true }
          }
        };
      }

      // Calculate NPS (assuming 1-5 scale, converting to 0-10 NPS scale)
      const npsResponses = responses.filter(r => r.score !== null);
      const npsScores = npsResponses.map(r => {
        // Convert 1-5 scale to 0-10 NPS scale
        return Math.round(((r.score - 1) / 4) * 10);
      });

      const promoters = npsScores.filter(score => score >= 9).length;
      const passives = npsScores.filter(score => score >= 7 && score <= 8).length;
      const detractors = npsScores.filter(score => score <= 6).length;
      const totalNPS = npsScores.length;

      const npsScore = totalNPS > 0 
        ? Math.round(((promoters - detractors) / totalNPS) * 100)
        : 0;

      // Calculate CSAT (percentage of 4-5 star ratings)
      const csatResponses = responses.filter(r => r.score !== null);
      const satisfiedResponses = csatResponses.filter(r => r.score >= 4).length;
      const csatScore = csatResponses.length > 0 
        ? Math.round((satisfiedResponses / csatResponses.length) * 100)
        : 0;

      // Calculate CES (simplified - using inverse of satisfaction for demonstration)
      // In real implementation, this would come from specific CES questions
      const cesScore = responses.length > 0
        ? Math.round(7 - (responses.reduce((sum, r) => sum + r.score, 0) / responses.length) * 1.4)
        : 3;

      // Calculate trends (simplified - comparing recent vs older data)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentResponses = responses.filter(r => 
        new Date(r.created_at) >= thirtyDaysAgo
      );
      const olderResponses = responses.filter(r => 
        new Date(r.created_at) < thirtyDaysAgo
      );

      const recentAvg = recentResponses.length > 0
        ? recentResponses.reduce((sum, r) => sum + r.score, 0) / recentResponses.length
        : 0;
      const olderAvg = olderResponses.length > 0
        ? olderResponses.reduce((sum, r) => sum + r.score, 0) / olderResponses.length
        : recentAvg;

      const trendValue = olderAvg > 0 
        ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
        : 0;

      return {
        nps: {
          score: npsScore,
          breakdown: {
            promoters: totalNPS > 0 ? Math.round((promoters / totalNPS) * 100) : 0,
            passives: totalNPS > 0 ? Math.round((passives / totalNPS) * 100) : 0,
            detractors: totalNPS > 0 ? Math.round((detractors / totalNPS) * 100) : 0
          },
          trend: {
            value: Math.abs(trendValue),
            isPositive: trendValue >= 0
          }
        },
        csat: {
          score: csatScore,
          totalResponses: csatResponses.length,
          trend: {
            value: Math.abs(trendValue),
            isPositive: trendValue >= 0
          }
        },
        ces: {
          score: Math.max(1, Math.min(7, cesScore)),
          trend: {
            value: Math.abs(trendValue),
            isPositive: trendValue <= 0 // For CES, lower is better
          }
        }
      };
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
