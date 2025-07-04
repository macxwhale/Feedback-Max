
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

interface PerformanceSummary {
  summary: Record<string, number>;
  totalMetrics: number;
}

class PerformanceMonitorClass {
  private metrics: PerformanceMetric[] = [];

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
  }

  getPerformanceSummary(): PerformanceSummary {
    const summary: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      summary[metric.name] = (summary[metric.name] || 0) + metric.value;
    });

    return {
      summary,
      totalMetrics: this.metrics.length,
    };
  }

  clearMetrics(): void {
    this.metrics = [];
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
  };
};
