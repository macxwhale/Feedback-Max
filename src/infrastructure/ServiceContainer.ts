/**
 * Service Container Implementation
 * Lightweight dependency injection container
 */

import type { IServiceContainer, ServiceRegistration } from '@/domain/interfaces/IServiceContainer';

export class ServiceContainer implements IServiceContainer {
  private static instance: ServiceContainer;
  private services = new Map<string | symbol, ServiceRegistration<unknown>>();
  private singletonInstances = new Map<string | symbol, unknown>();

  private constructor() {}

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  public register<T>(token: string | symbol, instance: T): void {
    this.services.set(token, { instance });
  }

  public registerFactory<T>(token: string | symbol, factory: () => T): void {
    this.services.set(token, { factory });
  }

  public registerSingleton<T>(token: string | symbol, factory: () => T): void {
    this.services.set(token, { factory, singleton: true });
  }

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

  public isRegistered(token: string | symbol): boolean {
    return this.services.has(token);
  }

  public clear(): void {
    this.services.clear();
    this.singletonInstances.clear();
  }
}

export const serviceContainer = ServiceContainer.getInstance();