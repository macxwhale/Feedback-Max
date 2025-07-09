/**
 * Enhanced Performance Service Implementation
 * Implements IPerformanceService for monitoring application performance
 */

import type { IPerformanceService, PerformanceMetric, ComponentPerformance } from '@/domain/interfaces/IPerformanceService';

export class EnhancedPerformanceService implements IPerformanceService {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentPerformance>();
  private measurements = new Map<string, number>();
  private readonly MAX_METRICS = 1000;

  trackComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.renderTime = (existing.renderTime + renderTime) / 2; // Running average
      existing.lastRender = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        lastRender: Date.now()
      });
    }

    // Add to general metrics
    this.addMetric({
      name: `component.${componentName}.render`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now()
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics].sort((a, b) => b.timestamp - a.timestamp);
  }

  getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.lastRender - a.lastRender);
  }

  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
    this.measurements.clear();
  }

  startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    this.addMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now()
    });

    return duration;
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-Math.floor(this.MAX_METRICS * 0.8));
    }
  }
}
