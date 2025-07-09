
/**
 * Service Registry
 * Configures and initializes all services with dependency injection
 */

import { container } from './DIContainer';
import { SERVICE_TOKENS } from './ServiceTokens';
import { EnhancedAnalyticsService } from '@/services/EnhancedAnalyticsService';
import { EnhancedPerformanceService } from '@/services/EnhancedPerformanceService';
import { EnhancedNotificationService } from '@/services/EnhancedNotificationService';
import { UserService } from '@/services/UserService';

/**
 * Initialize all services in the dependency injection container
 */
export function initializeServices(): void {
  // Analytics Service
  container.register(
    SERVICE_TOKENS.ANALYTICS_SERVICE,
    () => new EnhancedAnalyticsService(),
    true // singleton
  );

  // Performance Service
  container.register(
    SERVICE_TOKENS.PERFORMANCE_SERVICE,
    () => new EnhancedPerformanceService(),
    true // singleton
  );

  // Notification Service
  container.register(
    SERVICE_TOKENS.NOTIFICATION_SERVICE,
    () => new EnhancedNotificationService(),
    true // singleton
  );

  // User Service
  container.register(
    SERVICE_TOKENS.USER_SERVICE,
    () => new UserService(),
    true // singleton
  );
}

/**
 * Get service instance by token
 */
export function getService<T>(token: symbol): T {
  return container.resolve<T>(token);
}
