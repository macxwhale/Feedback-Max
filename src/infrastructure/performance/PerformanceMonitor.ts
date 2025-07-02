
/**
 * Performance Monitor (Refactored)
 * Orchestrates performance monitoring using composed services
 */

import { performanceCollector } from './PerformanceCollector';
import { metricsAggregator } from './MetricsAggregator';
import { performanceObservers } from './PerformanceObservers';
import { performanceReporter } from './PerformanceReporter';
import type { PerformanceReport } from './PerformanceReporter';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * Main performance monitor orchestrating all performance tracking
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    performanceObservers.initialize();
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    performanceCollector.addEntry({
      name: metric.name,
      startTime: metric.timestamp,
      duration: metric.value,
      entryType: 'custom',
      context: metric.context,
    });
  }

  /**
   * Track component performance
   */
  public trackComponent(componentName: string, renderTime: number): void {
    metricsAggregator.trackComponent(componentName, renderTime);
  }

  /**
   * Generate comprehensive performance report
   */
  public generateReport(): PerformanceReport {
    const entries = performanceCollector.getEntries();
    const summary = metricsAggregator.aggregateEntries(entries);
    const components = metricsAggregator.getComponentMetrics();

    return performanceReporter.generateReport(summary, components, entries);
  }

  /**
   * Get performance summary for dashboard
   */
  public getPerformanceSummary(): {
    metrics: any[];
    components: any[];
    summary: Record<string, number>;
  } {
    const entries = performanceCollector.getEntries();
    const summary = metricsAggregator.aggregateEntries(entries);
    const components = metricsAggregator.getComponentMetrics();

    return {
      metrics: entries.slice(-100), // Last 100 entries
      components,
      summary: summary.totals,
    };
  }

  /**
   * Clear all performance data
   */
  public clearMetrics(): void {
    performanceCollector.clearEntries();
    metricsAggregator.clearComponentMetrics();
  }

  /**
   * Cleanup and shutdown
   */
  public cleanup(): void {
    performanceObservers.cleanup();
    this.clearMetrics();
  }
}

/**
 * Hook for component performance tracking
 */
export const usePerformanceTracking = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTiming: (operationId: string, operation: string) => {
      // Start timing logic will be handled by PerformanceLogger
      const startTime = performance.now();
      return { operationId, operation, startTime };
    },
    endTiming: (operationId: string, operation: string, context?: Record<string, unknown>) => {
      // End timing logic will be handled by PerformanceLogger
      return performance.now();
    },
    trackRender: (renderTime: number) => {
      monitor.trackComponent(componentName, renderTime);
    },
    recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => {
      monitor.recordMetric({ ...metric, timestamp: Date.now() });
    },
  };
};

/**
 * Performance monitoring decorator
 */
export const withPerformanceTracking = <T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T => {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now();
          performanceMonitor.recordMetric({
            name: operationName,
            value: endTime - startTime,
            unit: 'ms',
            timestamp: startTime,
          });
        });
      } else {
        const endTime = performance.now();
        performanceMonitor.recordMetric({
          name: operationName,
          value: endTime - startTime,
          unit: 'ms',
          timestamp: startTime,
        });
        return result;
      }
    } catch (error) {
      const endTime = performance.now();
      performanceMonitor.recordMetric({
        name: operationName,
        value: endTime - startTime,
        unit: 'ms',
        timestamp: startTime,
        context: { error: true },
      });
      throw error;
    }
  }) as T;
};

/**
 * Default performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();
