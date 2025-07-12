
/**
 * Dependency Injection Container
 * Lightweight container for managing service dependencies
 */

type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

interface ServiceRegistration<T> {
  factory?: ServiceFactory<T>;
  instance?: ServiceInstance<T>;
  singleton?: boolean;
}

export class DIContainer {
  private static instance: DIContainer;
  private services = new Map<string | symbol, ServiceRegistration<unknown>>();
  private singletonInstances = new Map<string | symbol, unknown>();

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Register a service factory
   */
  public register<T>(token: string | symbol, factory: ServiceFactory<T>, singleton = false): void {
    this.services.set(token, { factory, singleton });
  }

  /**
   * Register a service instance
   */
  public registerInstance<T>(token: string | symbol, instance: ServiceInstance<T>): void {
    this.services.set(token, { instance });
  }

  /**
   * Resolve a service by token
   */
  public resolve<T>(token: string | symbol): T {
    const registration = this.services.get(token);
    
    if (!registration) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    // Return existing instance if available
    if (registration.instance) {
      return registration.instance as T;
    }

    // Handle singleton services
    if (registration.singleton) {
      const existing = this.singletonInstances.get(token);
      if (existing) {
        return existing as T;
      }
      
      if (registration.factory) {
        const instance = registration.factory();
        this.singletonInstances.set(token, instance);
        return instance as T;
      }
    }

    // Create new instance from factory
    if (registration.factory) {
      return registration.factory() as T;
    }

    throw new Error(`Unable to resolve service: ${String(token)}`);
  }

  /**
   * Check if a service is registered
   */
  public isRegistered(token: string | symbol): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  public clear(): void {
    this.services.clear();
    this.singletonInstances.clear();
  }
}

export const container = DIContainer.getInstance();
