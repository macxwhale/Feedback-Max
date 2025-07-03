/**
 * Service Container Hook
 * Provides easy access to services from React components
 */

import { useMemo } from 'react';
import { serviceContainer } from '@/infrastructure/ServiceContainer';
import { ServiceTokens } from '@/domain/interfaces/IServiceContainer';
import type { IUserService } from '@/domain/interfaces/IUserService';
import { UserService } from '@/services/UserService';

/**
 * Initialize services on first use
 */
const initializeServices = () => {
  if (!serviceContainer.isRegistered(ServiceTokens.USER_SERVICE)) {
    serviceContainer.registerSingleton(ServiceTokens.USER_SERVICE, () => new UserService());
  }
};

/**
 * Hook to get a service from the container
 */
export const useService = <T>(token: string | symbol): T => {
  return useMemo(() => {
    initializeServices();
    return serviceContainer.resolve<T>(token);
  }, [token]);
};

/**
 * Typed hooks for specific services
 */
export const useUserService = (): IUserService => {
  return useService<IUserService>(ServiceTokens.USER_SERVICE);
};

/**
 * Hook to access the service container directly
 */
export const useServiceContainer = () => {
  return useMemo(() => {
    initializeServices();
    return serviceContainer;
  }, []);
};