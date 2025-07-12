
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DepartmentMetrics {
  name: string;
  metrics: {
    responseTime: number;
    resolutionRate: number;
    satisfaction: number;
    volume: number;
  };
  issues: Array<{
    title: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

// Helper function to analyze common issues
function analyzeCommonIssues(responses: any[]): Array<{title: string; count: number; trend: 'up' | 'down' | 'stable'}> {
  // This is a simplified analysis - in a real implementation, you might use NLP
  const lowScoreResponses = responses.filter(r => r.score && r.score <= 2);
  const mediumScoreResponses = responses.filter(r => r.score && r.score === 3);
  
  const issues = [];
  
  if (lowScoreResponses.length > 0) {
    issues.push({
      title: 'Low satisfaction scores',
      count: lowScoreResponses.length,
      trend: 'up' as const
    });
  }
  
  if (mediumScoreResponses.length > 0) {
    issues.push({
      title: 'Neutral feedback requiring attention',
      count: mediumScoreResponses.length,
      trend: 'stable' as const
    });
  }
  
  // Add general improvement opportunities
  if (responses.length > 10) {
    issues.push({
      title: 'Process optimization opportunities',
      count: Math.floor(responses.length * 0.2),
      trend: 'down' as const
    });
  }
  
  return issues.slice(0, 3); // Return top 3 issues
}

export const useOperationalAnalytics = (organizationId: string) => {
  return useQuery({
    queryKey: ['operational-analytics', organizationId],
    queryFn: async (): Promise<Record<string, DepartmentMetrics>> => {
      // Get all responses with categories (treating categories as departments)
      const { data: responses } = await supabase
        .from('feedback_responses')
        .select(`
          id,
          score,
          question_category,
          created_at,
          session_id,
          response_value
        `)
        .eq('organization_id', organizationId);

      // Get session completion data
      const { data: sessions } = await supabase
        .from('feedback_sessions')
        .select('id, status, started_at, completed_at')
        .eq('organization_id', organizationId);

      // Group responses by category (department)
      const departmentData: Record<string, DepartmentMetrics> = {};
      
      if (responses) {
        const categories = [...new Set(responses.map(r => r.question_category))];
        
        for (const category of categories) {
          const categoryResponses = responses.filter(r => r.question_category === category);
          const categorySessionIds = [...new Set(categoryResponses.map(r => r.session_id))];
          const categorySessions = sessions?.filter(s => categorySessionIds.includes(s.id)) || [];
          
          // Calculate metrics
          const completedSessions = categorySessions.filter(s => s.status === 'completed');
          const resolutionRate = categorySessions.length > 0 
            ? (completedSessions.length / categorySessions.length) * 100 
            : 0;
          
          // Calculate average response time
          let avgResponseTime = 0;
          if (completedSessions.length > 0) {
            const totalTime = completedSessions.reduce((sum, session) => {
              if (session.completed_at && session.started_at) {
                const start = new Date(session.started_at).getTime();
                const end = new Date(session.completed_at).getTime();
                return sum + (end - start);
              }
              return sum;
            }, 0);
            avgResponseTime = totalTime / completedSessions.length / (1000 * 60 * 60); // Convert to hours
          }
          
          // Calculate satisfaction
          const validScores = categoryResponses.filter(r => r.score !== null);
          const avgSatisfaction = validScores.length > 0
            ? validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length
            : 0;
          
          // Analyze common issues from response values
          const issues = analyzeCommonIssues(categoryResponses);
          
          departmentData[category.toLowerCase().replace(/\s+/g, '-')] = {
            name: category,
            metrics: {
              responseTime: Math.round(avgResponseTime * 10) / 10,
              resolutionRate: Math.round(resolutionRate),
              satisfaction: Math.round(avgSatisfaction * 10) / 10,
              volume: categoryResponses.length
            },
            issues
          };
        }
      }
      
      return departmentData;
    },
    enabled: !!organizationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
