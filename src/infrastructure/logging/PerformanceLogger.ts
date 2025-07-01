
/**
 * Performance Logger
 * Structured performance monitoring and logging
 */

import { logger } from '@/utils/logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  context?: Record<string, unknown>;
  timestamp: number;
}

export class PerformanceLogger {
  private static timings: Map<string, number> = new Map();

  /**
   * Starts timing for an operation
   */
  public static startTiming(operationId: string, operation: string): void {
    const startTime = performance.now();
    this.timings.set(operationId, startTime);
    
    logger.debug('Performance: Operation started', {
      operationId,
      operation,
      startTime,
    });
  }

  /**
   * Ends timing for an operation and logs metrics
   */
  public static endTiming(
    operationId: string, 
    operation: string, 
    context?: Record<string, unknown>
  ): PerformanceMetrics {
    const endTime = performance.now();
    const startTime = this.timings.get(operationId);
    
    if (!startTime) {
      logger.warn('Performance: No start time found for operation', {
        operationId,
        operation,
      });
      return {
        operation,
        duration: 0,
        context,
        timestamp: endTime,
      };
    }

    const duration = endTime - startTime;
    const metrics: PerformanceMetrics = {
      operation,
      duration,
      context,
      timestamp: endTime,
    };

    // Log based on duration thresholds
    if (duration > 1000) {
      logger.warn('Performance: Slow operation detected', metrics);
    } else if (duration > 500) {
      logger.info('Performance: Operation completed', metrics);
    } else {
      logger.debug('Performance: Operation completed', metrics);
    }

    // Clean up
    this.timings.delete(operationId);

    return metrics;
  }

  /**
   * Decorator for timing functions
   */
  public static timed<T extends (...args: any[]) => any>(
    operation: string,
    fn: T,
    context?: Record<string, unknown>
  ): T {
    return ((...args: Parameters<T>) => {
      const operationId = `${operation}_${Date.now()}_${Math.random()}`;
      
      PerformanceLogger.startTiming(operationId, operation);
      
      try {
        const result = fn(...args);
        
        // Handle both sync and async functions
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            PerformanceLogger.endTiming(operationId, operation, context);
          });
        } else {
          PerformanceLogger.endTiming(operationId, operation, context);
          return result;
        }
      } catch (error) {
        PerformanceLogger.endTiming(operationId, operation, { ...context, error: true });
        throw error;
      }
    }) as T;
  }
}
