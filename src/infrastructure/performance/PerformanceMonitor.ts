
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

interface ComponentMetric {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  timestamp: number;
}

interface PerformanceSummary {
  summary: Record<string, number>;
  totalMetrics: number;
  components: ComponentMetric[];
}

// Import the PerformanceReport type from PerformanceReporter to ensure consistency
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

  getPerformanceSummary(): PerformanceSummary {
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
    const summary = this.getPerformanceSummary();
    const alerts = this.generateAlerts(summary);
    const recommendations = this.generateRecommendations(alerts);

    return {
      timestamp: Date.now(),
      summary,
      components: [...this.components],
      alerts,
      recommendations,
    };
  }

  private generateAlerts(summary: PerformanceSummary): PerformanceReport['alerts'] {
    const alerts: PerformanceReport['alerts'] = [];

    // Check for slow components
    const slowComponents = summary.components.filter(c => c.renderTime > 16);
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
    const longTaskTotal = summary.summary['long-task'] || 0;
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
