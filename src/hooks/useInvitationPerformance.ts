
/**
 * Invitation Performance Tracking Hook
 * Provides performance monitoring utilities for invitation operations
 */

import { useCallback } from 'react';
import { usePerformanceTracking } from '@/infrastructure/performance/PerformanceMonitor';
import { logger } from '@/utils/logger';

/**
 * Hook for tracking invitation performance metrics
 */
export const useInvitationPerformance = (componentName: string = 'InvitationComponent') => {
  const performance = usePerformanceTracking(componentName);

  const trackInvitationTiming = useCallback((
    operationName: string,
    operation: () => Promise<any>
  ) => {
    const operationId = `${operationName}_${Date.now()}`;
    
    return async () => {
      performance.startTiming(operationId, operationName);
      
      try {
        const result = await operation();
        performance.endTiming(operationId, operationName, { success: true });
        return result;
      } catch (error) {
        performance.endTiming(operationId, operationName, { 
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    };
  }, [performance]);

  const recordInvitationMetric = useCallback((
    metricName: string,
    value: number,
    context?: Record<string, unknown>
  ) => {
    performance.recordMetric({
      name: metricName,
      value,
      unit: 'count',
      timestamp: Date.now(),
      context,
    });

    logger.debug('Invitation metric recorded', {
      metric: metricName,
      value,
      context,
    });
  }, [performance]);

  return {
    trackTiming: trackInvitationTiming,
    recordMetric: recordInvitationMetric,
    startTiming: performance.startTiming,
    endTiming: performance.endTiming,
  };
};
