
/**
 * Enhanced Analytics Service Implementation
 * Implements IAnalyticsService with business logic extracted from components
 */

import { supabase } from '@/integrations/supabase/client';
import type { IAnalyticsService, AnalyticsData, AnalyticsMetrics } from '@/domain/interfaces/IAnalyticsService';

// Type for the RPC response from get_organization_stats_enhanced
interface OrganizationStatsResponse {
  total_sessions: number;
  completed_sessions: number;
  avg_session_score: number;
  total_questions: number;
  total_responses: number;
  active_members: number;
}

export class EnhancedAnalyticsService implements IAnalyticsService {
  private cache = new Map<string, { data: AnalyticsData; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getAnalytics(organizationId: string): Promise<AnalyticsData> {
    // Check cache first
    const cached = this.cache.get(organizationId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const { data: statsRaw } = await supabase.rpc('get_organization_stats_enhanced', {
        org_id: organizationId
      });

      if (!statsRaw) {
        throw new Error('No analytics data available');
      }

      // Type assertion for the RPC response
      const stats = statsRaw as unknown as OrganizationStatsResponse;

      const analyticsData: AnalyticsData = {
        organizationId,
        metrics: {
          totalSessions: stats.total_sessions || 0,
          completedSessions: stats.completed_sessions || 0,
          averageScore: stats.avg_session_score || 0,
          completionRate: stats.completed_sessions && stats.total_sessions 
            ? (stats.completed_sessions / stats.total_sessions) * 100 
            : 0,
          responseTime: await this.calculateAverageResponseTime(organizationId)
        },
        trends: await this.getTrendData(organizationId),
        insights: await this.generateInsights(organizationId)
      };

      // Cache the result
      this.cache.set(organizationId, { data: analyticsData, timestamp: Date.now() });
      
      return analyticsData;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  async getRealTimeMetrics(organizationId: string): Promise<AnalyticsMetrics> {
    const { data: statsRaw } = await supabase.rpc('get_organization_stats', {
      org_id: organizationId
    });

    if (!statsRaw) {
      throw new Error('No metrics data available');
    }

    // Type assertion for the RPC response
    const stats = statsRaw as unknown as OrganizationStatsResponse;

    return {
      totalSessions: stats.total_sessions || 0,
      completedSessions: stats.completed_sessions || 0,
      averageScore: stats.avg_session_score || 0,
      completionRate: stats.completed_sessions && stats.total_sessions 
        ? (stats.completed_sessions / stats.total_sessions) * 100 
        : 0,
      responseTime: await this.calculateAverageResponseTime(organizationId)
    };
  }

  async trackInteraction(event: string, data: Record<string, unknown>): Promise<void> {
    // Implementation for tracking user interactions
    console.log('Tracking interaction:', event, data);
  }

  async generateInsights(organizationId: string): Promise<string[]> {
    const insights: string[] = [];
    
    try {
      const metrics = await this.getRealTimeMetrics(organizationId);
      
      if (metrics.completionRate > 80) {
        insights.push('Excellent completion rate - users are highly engaged');
      } else if (metrics.completionRate < 50) {
        insights.push('Low completion rate - consider reviewing form length or question clarity');
      }
      
      if (metrics.averageScore > 80) {
        insights.push('High satisfaction scores indicate strong performance');
      } else if (metrics.averageScore < 60) {
        insights.push('Lower satisfaction scores suggest areas for improvement');
      }
      
      if (metrics.responseTime > 300) {
        insights.push('Response times are high - consider optimizing form performance');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
    
    return insights;
  }

  private async calculateAverageResponseTime(organizationId: string): Promise<number> {
    const { data } = await supabase
      .from('feedback_responses')
      .select('response_time_ms')
      .eq('organization_id', organizationId)
      .not('response_time_ms', 'is', null)
      .limit(100)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) return 0;

    const validTimes = data
      .map(r => r.response_time_ms)
      .filter((time): time is number => time !== null);

    return validTimes.length > 0 
      ? Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length / 1000)
      : 0;
  }

  private async getTrendData(organizationId: string): Promise<Array<{ date: string; sessions: number; score: number }>> {
    const { data } = await supabase
      .from('feedback_sessions')
      .select('created_at, total_score')
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (!data) return [];

    // Group by date and calculate aggregates
    const grouped = data.reduce((acc, session) => {
      const date = new Date(session.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sessions: 0, totalScore: 0, count: 0 };
      }
      acc[date].sessions++;
      if (session.total_score) {
        acc[date].totalScore += session.total_score;
        acc[date].count++;
      }
      return acc;
    }, {} as Record<string, { sessions: number; totalScore: number; count: number }>);

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      sessions: data.sessions,
      score: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
    }));
  }
}
