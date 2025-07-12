
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExecutiveInsights {
  alerts: Array<{
    type: 'warning' | 'critical';
    title: string;
    description: string;
  }>;
  achievements: string[];
  improvements: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
}

export const useExecutiveInsights = (organizationId: string) => {
  return useQuery({
    queryKey: ['executive-insights', organizationId],
    queryFn: async (): Promise<ExecutiveInsights> => {
      // Get basic stats
      const { data: responses } = await supabase
        .from('feedback_responses')
        .select('score, created_at')
        .eq('organization_id', organizationId)
        .not('score', 'is', null);

      const { data: sessions } = await supabase
        .from('feedback_sessions')
        .select('status, completed_at, started_at')
        .eq('organization_id', organizationId);

      if (!responses || !sessions) {
        return {
          alerts: [],
          achievements: ['System setup completed'],
          improvements: ['Collect more feedback data'],
          recommendations: [{
            title: 'Increase Response Collection',
            description: 'Focus on gathering more customer feedback to generate meaningful insights',
            priority: 'High'
          }]
        };
      }

      // Calculate key metrics
      const avgScore = responses.length > 0 
        ? responses.reduce((sum, r) => sum + r.score, 0) / responses.length 
        : 0;
      
      const completionRate = sessions.length > 0
        ? (sessions.filter(s => s.status === 'completed').length / sessions.length) * 100
        : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentResponses = responses.filter(r => new Date(r.created_at) >= thirtyDaysAgo);
      
      // Generate insights based on data
      const alerts = [];
      const achievements = [];
      const improvements = [];
      const recommendations = [];

      // Alerts
      if (avgScore < 3) {
        alerts.push({
          type: 'critical' as const,
          title: 'Low Satisfaction Score',
          description: `Average satisfaction score is ${avgScore.toFixed(1)}/5, below acceptable threshold`
        });
      }

      if (completionRate < 60) {
        alerts.push({
          type: 'warning' as const,
          title: 'Low Completion Rate',
          description: `Only ${completionRate.toFixed(1)}% of feedback sessions are being completed`
        });
      }

      // Achievements
      if (avgScore >= 4) {
        achievements.push('Maintaining high customer satisfaction scores');
      }
      
      if (completionRate >= 80) {
        achievements.push('Excellent feedback completion rates');
      }

      if (recentResponses.length > responses.length * 0.6) {
        achievements.push('Strong recent engagement with feedback collection');
      }

      // Improvements
      if (avgScore < 4) {
        improvements.push('Focus on improving overall customer satisfaction');
      }

      if (completionRate < 80) {
        improvements.push('Optimize feedback form to increase completion rates');
      }

      if (recentResponses.length < 10) {
        improvements.push('Increase frequency of feedback collection');
      }

      // Recommendations
      if (avgScore < 3.5) {
        recommendations.push({
          title: 'Customer Experience Improvement Program',
          description: 'Implement targeted initiatives to address low satisfaction scores',
          priority: 'High'
        });
      }

      if (completionRate < 70) {
        recommendations.push({
          title: 'Form Optimization',
          description: 'Simplify feedback forms and reduce completion time',
          priority: 'Medium'
        });
      }

      recommendations.push({
        title: 'Regular Feedback Analysis',
        description: 'Schedule monthly reviews of feedback trends and action items',
        priority: 'Medium'
      });

      return {
        alerts,
        achievements: achievements.length > 0 ? achievements : ['System operational'],
        improvements: improvements.length > 0 ? improvements : ['Continue current performance'],
        recommendations
      };
    },
    enabled: !!organizationId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
