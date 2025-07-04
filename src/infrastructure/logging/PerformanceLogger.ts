
/**
 * Performance Logger
 * Tracks timing and performance metrics
 */

interface PerformanceMetric {
  operationId: string;
  operationType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class PerformanceLoggerClass {
  private metrics = new Map<string, PerformanceMetric>();

  startTiming(operationId: string, operationType: string): void {
    this.metrics.set(operationId, {
      operationId,
      operationType,
      startTime: performance.now(),
    });
  }

  endTiming(operationId: string, operationType: string, metadata?: Record<string, unknown>): void {
    const metric = this.metrics.get(operationId);
    if (metric) {
      const endTime = performance.now();
      const duration = endTime - metric.startTime;
      
      this.metrics.set(operationId, {
        ...metric,
        endTime,
        duration,
        metadata,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${operationType} took ${duration.toFixed(2)}ms`, metadata);
      }
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const PerformanceLogger = new PerformanceLoggerClass();
