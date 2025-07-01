import React from 'react';

/**
 * Development Utilities
 * Tools and helpers for enhanced developer experience
 */

// Environment detection
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';
export const isTest = import.meta.env.MODE === 'test';

// Debug logging utility
export const createDebugger = (namespace: string) => {
  return {
    log: (...args: unknown[]) => {
      if (isDevelopment) {
        console.log(`[${namespace}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDevelopment) {
        console.warn(`[${namespace}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error(`[${namespace}]`, ...args);
    },
    group: (label: string, fn: () => void) => {
      if (isDevelopment) {
        console.group(`[${namespace}] ${label}`);
        fn();
        console.groupEnd();
      }
    },
  };
};

// Performance measurement
export const measurePerformance = async <T>(
  name: string, 
  fn: () => T | Promise<T>
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  if (isDevelopment) {
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
};

// Component display name helper
export const withDisplayName = <T extends React.ComponentType<any>>(
  Component: T,
  displayName: string
): T => {
  Component.displayName = displayName;
  return Component;
};

// Error boundary helper
export const createErrorBoundary = (fallback: React.ComponentType<any>) => {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return React.createElement(fallback);
      }
      return this.props.children;
    }
  };
};

// Local storage helpers with type safety
export const createStorageHelper = <T>(key: string, defaultValue: T) => ({
  get: (): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  },
  remove: (): void => {
    localStorage.removeItem(key);
  },
});

// Async retry utility
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
};

// Type guards
export const isString = (value: unknown): value is string => 
  typeof value === 'string';

export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

export const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = <T>(value: unknown): value is T[] => 
  Array.isArray(value);
