
import { useEffect, useCallback, useRef } from 'react';
import { debounce, throttle } from '@/utils/performanceUtils';

interface UsePerformanceOptimizationOptions {
  enableVirtualization?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
  enableMemoryCleanup?: boolean;
}

export const usePerformanceOptimization = (options: UsePerformanceOptimizationOptions = {}) => {
  const {
    enableVirtualization = false,
    debounceDelay = 300,
    throttleDelay = 100,
    enableMemoryCleanup = true
  } = options;

  const cleanupRefs = useRef<(() => void)[]>([]);

  // Debounced function factory
  const createDebouncedFunction = useCallback(
    <T extends (...args: any[]) => any>(fn: T): T => {
      const debouncedFn = debounce(fn, debounceDelay);
      if (enableMemoryCleanup) {
        cleanupRefs.current.push(() => {
          // Cleanup debounced function if needed
        });
      }
      return debouncedFn;
    },
    [debounceDelay, enableMemoryCleanup]
  );

  // Throttled function factory
  const createThrottledFunction = useCallback(
    <T extends (...args: any[]) => any>(fn: T): T => {
      const throttledFn = throttle(fn, throttleDelay);
      if (enableMemoryCleanup) {
        cleanupRefs.current.push(() => {
          // Cleanup throttled function if needed
        });
      }
      return throttledFn;
    },
    [throttleDelay, enableMemoryCleanup]
  );

  // Intersection Observer for lazy loading
  const createIntersectionObserver = useCallback(
    (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
      const observer = new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      });

      if (enableMemoryCleanup) {
        cleanupRefs.current.push(() => observer.disconnect());
      }

      return observer;
    },
    [enableMemoryCleanup]
  );

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableMemoryCleanup) {
        cleanupRefs.current.forEach(cleanup => cleanup());
        cleanupRefs.current = [];
      }
    };
  }, [enableMemoryCleanup]);

  // Performance monitoring
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    console.log(`${name} took ${endTime - startTime} milliseconds`);
  }, []);

  return {
    createDebouncedFunction,
    createThrottledFunction,
    createIntersectionObserver,
    measurePerformance
  };
};
