
/**
 * Service Tokens for Dependency Injection
 * Centralized registry of all service identifiers
 */

export const SERVICE_TOKENS = {
  // Core Services
  ANALYTICS_SERVICE: Symbol('AnalyticsService'),
  PERFORMANCE_SERVICE: Symbol('PerformanceService'),
  NOTIFICATION_SERVICE: Symbol('NotificationService'),
  
  // Business Services
  USER_SERVICE: Symbol('UserService'),
  ORGANIZATION_SERVICE: Symbol('OrganizationService'),
  FEEDBACK_SERVICE: Symbol('FeedbackService'),
  
  // Infrastructure Services
  CACHE_SERVICE: Symbol('CacheService'),
  LOGGER_SERVICE: Symbol('LoggerService'),
  VALIDATION_SERVICE: Symbol('ValidationService'),
} as const;

export type ServiceToken = typeof SERVICE_TOKENS[keyof typeof SERVICE_TOKENS];
