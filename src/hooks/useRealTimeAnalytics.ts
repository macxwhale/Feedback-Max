
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeMetrics {
  activeUsers: number;
  feedbackSubmissions: number;
  averageScore: number;
  responseTime: number;
}

export const useRealTimeAnalytics = (organizationId: string) => {
  const [liveData, setLiveData] = useState<RealTimeMetrics>({
    activeUsers: 0,
    feedbackSubmissions: 0,
    averageScore: 0,
    responseTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealTimeData = async () => {
    try {
      // Get active sessions from last 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { data: activeSessions } = await supabase
        .from('feedback_sessions')
        .select('id')
        .eq('organization_id', organizationId)
        .gte('started_at', tenMinutesAgo);

      // Get recent submissions (last 10 minutes)
      const { data: recentSubmissions } = await supabase
        .from('feedback_responses')
        .select('id, score')
        .eq('organization_id', organizationId)
        .gte('created_at', tenMinutesAgo);

      // Get average completion time for completed sessions
      const { data: completedSessions } = await supabase
        .from('feedback_sessions')
        .select('started_at, completed_at')
        .eq('organization_id', organizationId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(50);

      // Calculate average response time
      let avgResponseTime = 0;
      if (completedSessions && completedSessions.length > 0) {
        const totalTime = completedSessions.reduce((sum, session) => {
          const start = new Date(session.started_at).getTime();
          const end = new Date(session.completed_at!).getTime();
          return sum + (end - start);
        }, 0);
        avgResponseTime = totalTime / completedSessions.length / (1000 * 60); // Convert to minutes
      }

      // Calculate average score from recent submissions
      let avgScore = 0;
      if (recentSubmissions && recentSubmissions.length > 0) {
        const validScores = recentSubmissions.filter(r => r.score !== null);
        if (validScores.length > 0) {
          avgScore = validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length;
        }
      }

      setLiveData({
        activeUsers: activeSessions?.length || 0,
        feedbackSubmissions: recentSubmissions?.length || 0,
        averageScore: Math.round(avgScore * 10) / 10,
        responseTime: Math.round(avgResponseTime * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationId) return;

    fetchRealTimeData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, [organizationId]);

  return { liveData, isLoading, refetch: fetchRealTimeData };
};
