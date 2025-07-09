
/**
 * Performance Service Interface
 * Defines contract for performance monitoring
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRender: number;
}

export interface IPerformanceService {
  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number): void;

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetric[];

  /**
   * Get component performance data
   */
  getComponentMetrics(): ComponentPerformance[];

  /**
   * Clear performance data
   */
  clearMetrics(): void;

  /**
   * Start performance measurement
   */
  startMeasurement(name: string): void;

  /**
   * End performance measurement
   */
  endMeasurement(name: string): number;
}
