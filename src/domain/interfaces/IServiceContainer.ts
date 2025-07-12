/**
 * Service Container Interface
 * Defines the contract for dependency injection container
 */

export interface IServiceContainer {
  /**
   * Register a service instance
   */
  register<T>(token: string | symbol, instance: T): void;

  /**
   * Register a service factory
   */
  registerFactory<T>(token: string | symbol, factory: () => T): void;

  /**
   * Register a singleton service
   */
  registerSingleton<T>(token: string | symbol, factory: () => T): void;

  /**
   * Resolve a service by token
   */
  resolve<T>(token: string | symbol): T;

  /**
   * Check if a service is registered
   */
  isRegistered(token: string | symbol): boolean;

  /**
   * Clear all registrations
   */
  clear(): void;
}

/**
 * Service registration options
 */
export interface ServiceRegistration<T> {
  instance?: T;
  factory?: () => T;
  singleton?: boolean;
}

/**
 * Service tokens for type-safe injection
 */
export const ServiceTokens = {
  USER_SERVICE: Symbol('UserService'),
  ORGANIZATION_SERVICE: Symbol('OrganizationService'),
  FEEDBACK_SERVICE: Symbol('FeedbackService'),
  ANALYTICS_SERVICE: Symbol('AnalyticsService'),
  NOTIFICATION_SERVICE: Symbol('NotificationService'),
  LOGGER_SERVICE: Symbol('LoggerService'),
  CACHE_SERVICE: Symbol('CacheService'),
} as const;

export type ServiceToken = typeof ServiceTokens[keyof typeof ServiceTokens];