
/**
 * Performance Monitoring System
 * Comprehensive performance tracking and optimization utilities
 */

import { logger } from '@/utils/logger';
import { PerformanceLogger } from '@/infrastructure/logging/PerformanceLogger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface ComponentPerformanceData {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  propsChanges: number;
  memoryUsage?: number;
}

/**
 * Performance Monitor for React applications
 * Tracks rendering performance, memory usage, and user interactions
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private componentMetrics: Map<string, ComponentPerformanceData> = new Map();

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    try {
      // Long Task Observer
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            unit: 'ms',
            timestamp: entry.startTime,
            context: { entryType: entry.entryType },
          });

          if (entry.duration > 50) {
            logger.warn('Long task detected', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // Navigation Observer
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          this.recordNavigationMetrics(navEntry);
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Paint Observer
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            context: { entryType: entry.entryType },
          });
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

    } catch (error) {
      logger.error('Failed to initialize performance observers', {}, error as Error);
    }
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = [
      { name: 'dns-lookup', value: entry.domainLookupEnd - entry.domainLookupStart },
      { name: 'tcp-connect', value: entry.connectEnd - entry.connectStart },
      { name: 'request-response', value: entry.responseEnd - entry.requestStart },
      { name: 'dom-processing', value: entry.domComplete - entry.responseEnd },
      { name: 'total-load', value: entry.loadEventEnd - entry.fetchStart },
    ];

    metrics.forEach((metric) => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }
    });
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Log significant metrics
    if (metric.value > 100 && metric.unit === 'ms') {
      logger.info('Performance metric recorded', {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        context: metric.context,
      });
    }

    // Keep metrics array bounded
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Track component performance
   */
  public trackComponent(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderTime = renderTime;
      existing.rerenderCount += 1;
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        rerenderCount: 1,
        propsChanges: 0,
      });
    }

    // Log slow renders
    if (renderTime > 16) {
      logger.warn('Slow component render detected', {
        componentName,
        renderTime,
      });
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    components: ComponentPerformanceData[];
    summary: Record<string, number>;
  } {
    const summary: Record<string, number> = {};
    
    // Aggregate metrics by name
    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = 0;
      }
      summary[metric.name] += metric.value;
    });

    return {
      metrics: this.metrics.slice(-100), // Last 100 metrics
      components: Array.from(this.componentMetrics.values()),
      summary,
    };
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
  }
}

/**
 * Hook for component performance tracking
 */
export const usePerformanceTracking = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTiming: (operationId: string, operation: string) => {
      PerformanceLogger.startTiming(operationId, operation);
    },
    endTiming: (operationId: string, operation: string, context?: Record<string, unknown>) => {
      return PerformanceLogger.endTiming(operationId, operation, context);
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
    const operationId = `${operationName}_${Date.now()}_${Math.random()}`;
    
    PerformanceLogger.startTiming(operationId, operationName);
    
    try {
      const result = fn(...args);
      
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          PerformanceLogger.endTiming(operationId, operationName);
        });
      } else {
        PerformanceLogger.endTiming(operationId, operationName);
        return result;
      }
    } catch (error) {
      PerformanceLogger.endTiming(operationId, operationName, { error: true });
      throw error;
    }
  }) as T;
};

/**
 * Default performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();
