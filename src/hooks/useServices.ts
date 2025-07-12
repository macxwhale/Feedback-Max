
/**
 * Service Hooks
 * React hooks for accessing services through dependency injection
 */

import { useMemo } from 'react';
import { getService } from '@/infrastructure/di/ServiceRegistry';
import { SERVICE_TOKENS } from '@/infrastructure/di/ServiceTokens';
import type { IAnalyticsService } from '@/domain/interfaces/IAnalyticsService';
import type { IPerformanceService } from '@/domain/interfaces/IPerformanceService';
import type { INotificationService } from '@/domain/interfaces/INotificationService';
import type { IUserService } from '@/domain/interfaces/IUserService';

/**
 * Hook to access Analytics Service
 */
export function useAnalyticsService(): IAnalyticsService {
  return useMemo(() => getService<IAnalyticsService>(SERVICE_TOKENS.ANALYTICS_SERVICE), []);
}

/**
 * Hook to access Performance Service
 */
export function usePerformanceService(): IPerformanceService {
  return useMemo(() => getService<IPerformanceService>(SERVICE_TOKENS.PERFORMANCE_SERVICE), []);
}

/**
 * Hook to access Notification Service
 */
export function useNotificationService(): INotificationService {
  return useMemo(() => getService<INotificationService>(SERVICE_TOKENS.NOTIFICATION_SERVICE), []);
}

/**
 * Hook to access User Service
 */
export function useUserService(): IUserService {
  return useMemo(() => getService<IUserService>(SERVICE_TOKENS.USER_SERVICE), []);
}

/**
 * Hook for component performance tracking
 */
export function useComponentPerformance(componentName: string) {
  const performanceService = usePerformanceService();
  
  return useMemo(() => ({
    startMeasurement: () => performanceService.startMeasurement(componentName),
    endMeasurement: () => performanceService.endMeasurement(componentName),
    trackRender: (renderTime: number) => performanceService.trackComponentRender(componentName, renderTime)
  }), [performanceService, componentName]);
}
