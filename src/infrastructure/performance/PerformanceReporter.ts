
/**
 * Performance Reporter
 * Generates performance reports and recommendations
 */

import type { MetricsSummary, ComponentMetric } from './MetricsAggregator';

export interface PerformanceAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

export interface PerformanceReport {
  timestamp: number;
  summary: MetricsSummary;
  components: ComponentMetric[];
  alerts: PerformanceAlert[];
  recommendations: string[];
}

class PerformanceReporterClass {
  private readonly thresholds = {
    componentRenderTime: 16, // 16ms for 60fps
    memoryUsage: 50 * 1024 * 1024, // 50MB
    loadTime: 3000, // 3 seconds
    firstPaint: 1000, // 1 second
  };

  generateReport(summary: MetricsSummary, components: ComponentMetric[]): PerformanceReport {
    const alerts = this.generateAlerts(summary, components);
    const recommendations = this.generateRecommendations(alerts);

    return {
      timestamp: Date.now(),
      summary,
      components,
      alerts,
      recommendations,
    };
  }

  private generateAlerts(summary: MetricsSummary, components: ComponentMetric[]): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    // Check memory usage
    if (summary.averages.memoryUsage && summary.averages.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push({
        severity: summary.averages.memoryUsage > this.thresholds.memoryUsage * 2 ? 'critical' : 'high',
        message: 'High memory usage detected',
        metric: 'memory',
        value: summary.averages.memoryUsage,
        threshold: this.thresholds.memoryUsage,
      });
    }

    // Check load time
    if (summary.averages.loadTime && summary.averages.loadTime > this.thresholds.loadTime) {
      alerts.push({
        severity: summary.averages.loadTime > this.thresholds.loadTime * 2 ? 'critical' : 'medium',
        message: 'Slow page load time',
        metric: 'load-time',
        value: summary.averages.loadTime,
        threshold: this.thresholds.loadTime,
      });
    }

    // Check component render times
    const slowComponents = components.filter(c => c.renderTime > this.thresholds.componentRenderTime);
    if (slowComponents.length > 0) {
      alerts.push({
        severity: slowComponents.length > 5 ? 'high' : 'medium',
        message: `${slowComponents.length} components are rendering slowly`,
        metric: 'component-render-time',
        value: slowComponents.length,
        threshold: 1,
      });
    }

    return alerts;
  }

  private generateRecommendations(alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    if (alerts.some(a => a.metric === 'memory')) {
      recommendations.push('Consider implementing component cleanup and memory optimization');
      recommendations.push('Review large object allocations and implement proper garbage collection');
    }

    if (alerts.some(a => a.metric === 'load-time')) {
      recommendations.push('Implement code splitting to reduce initial bundle size');
      recommendations.push('Optimize asset loading with lazy loading and compression');
    }

    if (alerts.some(a => a.metric === 'component-render-time')) {
      recommendations.push('Consider using React.memo, useMemo, or useCallback for expensive computations');
      recommendations.push('Review component dependencies and optimize render cycles');
    }

    return recommendations;
  }

  exportReport(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2);
  }

  calculateScore(report: PerformanceReport): number {
    let score = 100;

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

export const performanceReporter = new PerformanceReporterClass();
