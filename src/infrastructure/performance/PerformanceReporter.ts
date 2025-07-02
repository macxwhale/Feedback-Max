
/**
 * Performance Reporter
 * Handles performance data reporting and alerting
 */

import { logger } from '@/utils/logger';
import type { MetricsSummary, ComponentMetric } from './MetricsAggregator';
import type { PerformanceEntry } from './PerformanceCollector';

export interface PerformanceReport {
  timestamp: number;
  summary: MetricsSummary;
  components: ComponentMetric[];
  alerts: PerformanceAlert[];
  recommendations: string[];
}

export interface PerformanceAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

/**
 * Generates performance reports and alerts
 */
export class PerformanceReporter {
  private static instance: PerformanceReporter;
  private readonly thresholds = {
    longTask: 50,
    renderTime: 16,
    totalLoad: 3000,
    firstPaint: 1000,
    memoryUsage: 50 * 1024 * 1024, // 50MB
  };

  private constructor() {}

  public static getInstance(): PerformanceReporter {
    if (!PerformanceReporter.instance) {
      PerformanceReporter.instance = new PerformanceReporter();
    }
    return PerformanceReporter.instance;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(
    summary: MetricsSummary,
    components: ComponentMetric[],
    entries: PerformanceEntry[]
  ): PerformanceReport {
    const alerts = this.generateAlerts(summary, components, entries);
    const recommendations = this.generateRecommendations(alerts, components);

    const report: PerformanceReport = {
      timestamp: Date.now(),
      summary,
      components,
      alerts,
      recommendations,
    };

    // Log significant issues
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      logger.error('Critical performance issues detected', {
        alertCount: criticalAlerts.length,
        alerts: criticalAlerts,
      });
    }

    return report;
  }

  /**
   * Generate performance alerts
   */
  private generateAlerts(
    summary: MetricsSummary,
    components: ComponentMetric[],
    entries: PerformanceEntry[]
  ): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    // Check long tasks
    const longTaskTotal = summary.totals['long-task'] || 0;
    if (longTaskTotal > this.thresholds.longTask) {
      alerts.push({
        severity: 'high',
        message: 'Detected blocking long tasks that may cause UI freezing',
        metric: 'long-task',
        value: longTaskTotal,
        threshold: this.thresholds.longTask,
      });
    }

    // Check slow components
    const slowComponents = components.filter(c => c.renderTime > this.thresholds.renderTime);
    if (slowComponents.length > 0) {
      alerts.push({
        severity: 'medium',
        message: `${slowComponents.length} components are rendering slowly`,
        metric: 'component-render-time',
        value: slowComponents.length,
        threshold: 1,
      });
    }

    // Check total load time
    const totalLoad = summary.averages['total-load'] || 0;
    if (totalLoad > this.thresholds.totalLoad) {
      alerts.push({
        severity: 'high',
        message: 'Page load time exceeds recommended threshold',
        metric: 'total-load',
        value: totalLoad,
        threshold: this.thresholds.totalLoad,
      });
    }

    // Check first paint
    const firstPaint = summary.averages['first-paint'] || 0;
    if (firstPaint > this.thresholds.firstPaint) {
      alerts.push({
        severity: 'medium',
        message: 'First paint time is slower than optimal',
        metric: 'first-paint',
        value: firstPaint,
        threshold: this.thresholds.firstPaint,
      });
    }

    return alerts;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    alerts: PerformanceAlert[],
    components: ComponentMetric[]
  ): string[] {
    const recommendations: string[] = [];

    // Long task recommendations
    if (alerts.some(a => a.metric === 'long-task')) {
      recommendations.push('Consider breaking down long-running operations using time slicing or web workers');
    }

    // Component recommendations
    const slowComponents = components.filter(c => c.renderTime > this.thresholds.renderTime);
    if (slowComponents.length > 0) {
      recommendations.push(`Optimize slow components: ${slowComponents.map(c => c.componentName).join(', ')}`);
      recommendations.push('Consider using React.memo, useMemo, or useCallback for expensive computations');
    }

    // Load time recommendations
    if (alerts.some(a => a.metric === 'total-load')) {
      recommendations.push('Optimize bundle size with code splitting and lazy loading');
      recommendations.push('Consider implementing resource preloading for critical assets');
    }

    // Paint recommendations
    if (alerts.some(a => a.metric === 'first-paint')) {
      recommendations.push('Minimize critical rendering path by inlining critical CSS');
      recommendations.push('Optimize images and use next-gen formats (WebP, AVIF)');
    }

    return recommendations;
  }

  /**
   * Export report as JSON
   */
  exportReport(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Get performance score (0-100)
   */
  calculateScore(report: PerformanceReport): number {
    let score = 100;

    // Deduct points based on alert severity
    report.alerts.forEach(alert => {
      switch (alert.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }
}

export const performanceReporter = PerformanceReporter.getInstance();
