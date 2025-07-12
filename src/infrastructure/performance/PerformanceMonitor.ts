
/**
 * Performance Monitor
 * Tracks application performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

// Import types from MetricsAggregator for consistency
import type { MetricsSummary, ComponentMetric } from './MetricsAggregator';
import type { PerformanceReport } from './PerformanceReporter';

class PerformanceMonitorClass {
  private metrics: PerformanceMetric[] = [];
  private components: ComponentMetric[] = [];

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
  }

  addComponentMetric(metric: ComponentMetric): void {
    this.components.push(metric);
  }

  getPerformanceSummary(): { summary: Record<string, number>; totalMetrics: number; components: ComponentMetric[] } {
    const summary: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      summary[metric.name] = (summary[metric.name] || 0) + metric.value;
    });

    return {
      summary,
      totalMetrics: this.metrics.length,
      components: [...this.components],
    };
  }

  generateReport(): PerformanceReport {
    // Create a proper MetricsSummary with all required properties
    const metricsSummary: MetricsSummary = {
      averages: {},
      totals: {},
      counts: {},
      percentiles: {}
    };

    // Populate the summary from our metrics
    this.metrics.forEach(metric => {
      metricsSummary.totals[metric.name] = (metricsSummary.totals[metric.name] || 0) + metric.value;
      metricsSummary.counts[metric.name] = (metricsSummary.counts[metric.name] || 0) + 1;
    });

    // Calculate averages
    Object.keys(metricsSummary.totals).forEach(key => {
      const total = metricsSummary.totals[key];
      const count = metricsSummary.counts[key];
      metricsSummary.averages[key] = count > 0 ? total / count : 0;
    });

    const alerts = this.generateAlerts(metricsSummary);
    const recommendations = this.generateRecommendations(alerts);

    return {
      timestamp: Date.now(),
      summary: metricsSummary,
      components: [...this.components],
      alerts,
      recommendations,
    };
  }

  private generateAlerts(summary: MetricsSummary): PerformanceReport['alerts'] {
    const alerts: PerformanceReport['alerts'] = [];

    // Check for slow components
    const slowComponents = this.components.filter(c => c.renderTime > 16);
    if (slowComponents.length > 0) {
      alerts.push({
        severity: 'medium',
        message: `${slowComponents.length} components are rendering slowly`,
        metric: 'component-render-time',
        value: slowComponents.length,
        threshold: 1,
      });
    }

    // Check for long tasks
    const longTaskTotal = summary.totals['long-task'] || 0;
    if (longTaskTotal > 50) {
      alerts.push({
        severity: 'high',
        message: 'Detected blocking long tasks that may cause UI freezing',
        metric: 'long-task',
        value: longTaskTotal,
        threshold: 50,
      });
    }

    return alerts;
  }

  private generateRecommendations(alerts: PerformanceReport['alerts']): string[] {
    const recommendations: string[] = [];

    if (alerts.some(a => a.metric === 'component-render-time')) {
      recommendations.push('Consider using React.memo, useMemo, or useCallback for expensive computations');
    }

    if (alerts.some(a => a.metric === 'long-task')) {
      recommendations.push('Consider breaking down long-running operations using time slicing or web workers');
    }

    return recommendations;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.components = [];
  }
}

export const performanceMonitor = new PerformanceMonitorClass();

export const usePerformanceTracking = (componentName: string) => {
  return {
    startTiming: (operationId: string, operationType: string) => {
      console.log(`Performance tracking started for ${componentName}: ${operationType}`);
    },
    endTiming: (operationId: string, operationType: string, metadata?: Record<string, unknown>) => {
      console.log(`Performance tracking ended for ${componentName}: ${operationType}`, metadata);
    },
    recordMetric: (metric: PerformanceMetric) => {
      performanceMonitor.recordMetric(metric);
    },
  };
};
