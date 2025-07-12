
/**
 * Service Registry
 * Implements dependency injection container following IoC principles
 */

import type { IUserInvitationService } from '@/domain/interfaces/IUserInvitationService';
import { UserInvitationService } from '@/services/userInvitationService';
import { OptimizedUserInvitationService } from '@/infrastructure/performance/OptimizedUserInvitationService';
import { UserInvitationApplicationService } from '@/application/services/UserInvitationApplicationService';

/**
 * Service Registry for dependency injection
 * Follows the Service Locator pattern for clean dependency management
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, unknown> = new Map();

  private constructor() {
    this.registerDefaultServices();
  }

  /**
   * Gets the singleton instance
   */
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Registers default service implementations
   */
  private registerDefaultServices(): void {
    // Register domain services with performance optimization
    const baseService = new UserInvitationService();
    const optimizedService = new OptimizedUserInvitationService(baseService);
    
    this.register<IUserInvitationService>('IUserInvitationService', optimizedService);
    
    // Register application services
    this.register<UserInvitationApplicationService>(
      'UserInvitationApplicationService',
      new UserInvitationApplicationService(optimizedService)
    );
  }

  /**
   * Registers a service implementation
   */
  public register<T>(key: string, implementation: T): void {
    this.services.set(key, implementation);
  }

  /**
   * Resolves a service by key
   */
  public resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found: ${key}`);
    }
    return service as T;
  }

  /**
   * Checks if a service is registered
   */
  public has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Clears all registered services (useful for testing)
   */
  public clear(): void {
    this.services.clear();
  }
}

/**
 * Convenience functions for service resolution
 */
export const serviceRegistry = ServiceRegistry.getInstance();

export const resolveUserInvitationService = (): IUserInvitationService =>
  serviceRegistry.resolve<IUserInvitationService>('IUserInvitationService');

export const resolveUserInvitationApplicationService = (): UserInvitationApplicationService =>
  serviceRegistry.resolve<UserInvitationApplicationService>('UserInvitationApplicationService');
