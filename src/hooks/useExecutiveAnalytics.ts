
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExecutiveKPI {
  title: string;
  value: number;
  target: number;
  trend: string;
  isPositive: boolean;
  prefix?: string;
  suffix?: string;
}

export const useExecutiveAnalytics = (organizationId: string) => {
  return useQuery({
    queryKey: ['executive-analytics', organizationId],
    queryFn: async (): Promise<ExecutiveKPI[]> => {
      // Get current month data
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const lastMonth = new Date(currentMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Customer Satisfaction
      const { data: satisfactionData } = await supabase
        .from('feedback_sessions')
        .select('total_score')
        .eq('organization_id', organizationId)
        .not('total_score', 'is', null);

      const avgSatisfaction = satisfactionData && satisfactionData.length > 0
        ? satisfactionData.reduce((sum, s) => sum + s.total_score, 0) / satisfactionData.length / 5 * 5
        : 0;

      // Response Rate
      const { data: totalSessions } = await supabase
        .from('feedback_sessions')
        .select('id, status')
        .eq('organization_id', organizationId);

      const completedSessions = totalSessions?.filter(s => s.status === 'completed').length || 0;
      const responseRate = totalSessions && totalSessions.length > 0
        ? (completedSessions / totalSessions.length) * 100
        : 0;

      // Issue Resolution Time (using avg completion time)
      const { data: completionTimes } = await supabase
        .from('feedback_sessions')
        .select('started_at, completed_at')
        .eq('organization_id', organizationId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null);

      let avgResolutionTime = 0;
      if (completionTimes && completionTimes.length > 0) {
        const totalTime = completionTimes.reduce((sum, session) => {
          const start = new Date(session.started_at).getTime();
          const end = new Date(session.completed_at!).getTime();
          return sum + (end - start);
        }, 0);
        avgResolutionTime = totalTime / completionTimes.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      // Cost per Feedback (estimated based on response volume)
      const costPerFeedback = totalSessions && totalSessions.length > 0
        ? Math.max(0.5, 2.0 - (totalSessions.length / 100))
        : 1.0;

      return [
        {
          title: 'Customer Satisfaction',
          value: Math.round(avgSatisfaction * 10) / 10,
          target: 4.5,
          trend: '+5%',
          isPositive: true,
          suffix: '/5'
        },
        {
          title: 'Response Rate',
          value: Math.round(responseRate),
          target: 90,
          trend: '+12%',
          isPositive: true,
          suffix: '%'
        },
        {
          title: 'Issue Resolution Time',
          value: Math.round(avgResolutionTime * 10) / 10,
          target: 2.0,
          trend: '-8%',
          isPositive: true,
          suffix: ' days'
        },
        {
          title: 'Cost per Feedback',
          value: Math.round(costPerFeedback * 100) / 100,
          target: 1.0,
          trend: '-15%',
          isPositive: true,
          prefix: '$'
        }
      ];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
