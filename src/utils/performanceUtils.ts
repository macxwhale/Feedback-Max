
/**
 * Performance Utilities
 * Common performance measurement and optimization helpers
 */

/**
 * Measure function execution time
 */
export const measureTime = async <T>(
  fn: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;
  
  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
};

/**
 * Throttle function execution
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

/**
 * Check if performance API is available
 */
export const isPerformanceSupported = (): boolean => {
  return typeof window !== 'undefined' && 'performance' in window;
};

/**
 * Get memory usage (if available)
 */
export const getMemoryUsage = (): {
  used: number;
  total: number;
  limit: number;
} | null => {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
  };
};

/**
 * Format performance metrics for display
 */
export const formatMetric = (value: number, unit: string): string => {
  if (unit === 'ms') {
    return `${value.toFixed(1)}ms`;
  }
  if (unit === 'bytes') {
    return formatBytes(value);
  }
  return `${value.toFixed(0)} ${unit}`;
};

/**
 * Format bytes to human-readable format
 */
export const formatBytes = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Calculate performance score from metrics
 */
export const calculatePerformanceScore = (metrics: {
  firstPaint?: number;
  totalLoad?: number;
  longTasks?: number;
}): number => {
  let score = 100;
  
  // Deduct for slow first paint (> 1000ms)
  if (metrics.firstPaint && metrics.firstPaint > 1000) {
    score -= Math.min(30, (metrics.firstPaint - 1000) / 100);
  }
  
  // Deduct for slow total load (> 3000ms)
  if (metrics.totalLoad && metrics.totalLoad > 3000) {
    score -= Math.min(40, (metrics.totalLoad - 3000) / 200);
  }
  
  // Deduct for long tasks (> 50ms)
  if (metrics.longTasks && metrics.longTasks > 50) {
    score -= Math.min(30, (metrics.longTasks - 50) / 10);
  }
  
  return Math.max(0, Math.round(score));
};

/**
 * Get performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  FIRST_PAINT: 1000,      // 1 second
  TOTAL_LOAD: 3000,       // 3 seconds
  LONG_TASK: 50,          // 50ms
  RENDER_TIME: 16,        // 16ms (60fps)
  MEMORY_LIMIT: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Check if metric exceeds threshold
 */
export const exceedsThreshold = (
  metric: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): boolean => {
  return value > PERFORMANCE_THRESHOLDS[metric];
};
