
/**
 * Development Hook
 * Enhanced developer experience utilities as React hooks
 */

import { useEffect, useRef, useState } from 'react';
import { createDebugger, isDevelopment } from '@/utils/development';

// Debug hook for component lifecycle
export const useDebugLifecycle = (componentName: string) => {
  const debug = createDebugger(`Component:${componentName}`);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    debug.log(`Mounted (render #${renderCount.current})`);
    
    return () => {
      debug.log('Unmounted');
    };
  }, []);

  useEffect(() => {
    if (renderCount.current > 1) {
      debug.log(`Re-rendered (render #${renderCount.current})`);
    }
  });

  return { renderCount: renderCount.current };
};

// Hook for debugging prop changes
export const useDebugProps = <T extends Record<string, unknown>>(
  props: T,
  componentName: string
) => {
  const debug = createDebugger(`Props:${componentName}`);
  const prevProps = useRef<T>();

  useEffect(() => {
    if (prevProps.current && isDevelopment) {
      const changedProps = Object.keys(props).filter(
        key => props[key] !== prevProps.current?.[key]
      );
      
      if (changedProps.length > 0) {
        debug.group('Props changed', () => {
          changedProps.forEach(key => {
            console.log(`${key}:`, prevProps.current?.[key], '->', props[key]);
          });
        });
      }
    }
    
    prevProps.current = props;
  });
};

// Hook for performance monitoring
export const usePerformanceMonitor = (operationName: string) => {
  const startTime = useRef<number>();
  
  const start = () => {
    startTime.current = performance.now();
  };

  const end = () => {
    if (startTime.current && isDevelopment) {
      const duration = performance.now() - startTime.current;
      console.log(`⚡ ${operationName}: ${duration.toFixed(2)}ms`);
    }
  };

  return { start, end };
};

// Hook for local storage with debugging
export const useDebugLocalStorage = <T>(key: string, defaultValue: T) => {
  const debug = createDebugger(`LocalStorage:${key}`);
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : defaultValue;
      debug.log('Loaded from localStorage:', parsed);
      return parsed;
    } catch (error) {
      debug.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
      debug.log('Saved to localStorage:', valueToStore);
    } catch (error) {
      debug.error('Failed to save to localStorage:', error);
    }
  };

  return [value, setStoredValue] as const;
};

// Hook for async state debugging
export const useDebugAsyncState = <T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
  operationName: string
) => {
  const debug = createDebugger(`AsyncState:${operationName}`);
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    
    const execute = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      debug.log('Starting async operation');
      
      try {
        const result = await asyncFn();
        
        if (!cancelled) {
          setState({ data: result, loading: false, error: null });
          debug.log('Async operation completed:', result);
        }
      } catch (error) {
        if (!cancelled) {
          const err = error as Error;
          setState({ data: null, loading: false, error: err });
          debug.error('Async operation failed:', err);
        }
      }
    };

    execute();
    
    return () => {
      cancelled = true;
      debug.log('Async operation cancelled');
    };
  }, deps);

  return state;
};
