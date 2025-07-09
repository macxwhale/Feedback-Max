
/**
 * Analytics Service Interface
 * Defines contract for analytics operations
 */

export interface AnalyticsMetrics {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  completionRate: number;
  responseTime: number;
}

export interface AnalyticsData {
  organizationId: string;
  metrics: AnalyticsMetrics;
  trends: Array<{
    date: string;
    sessions: number;
    score: number;
  }>;
  insights: string[];
}

export interface IAnalyticsService {
  /**
   * Get analytics data for an organization
   */
  getAnalytics(organizationId: string): Promise<AnalyticsData>;

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(organizationId: string): Promise<AnalyticsMetrics>;

  /**
   * Track user interaction
   */
  trackInteraction(event: string, data: Record<string, unknown>): Promise<void>;

  /**
   * Generate insights from data
   */
  generateInsights(organizationId: string): Promise<string[]>;
}
