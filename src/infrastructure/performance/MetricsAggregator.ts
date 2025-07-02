
/**
 * Metrics Aggregator
 * Processes and aggregates performance data for reporting
 */

import type { PerformanceEntry } from './PerformanceCollector';

export interface MetricsSummary {
  averages: Record<string, number>;
  totals: Record<string, number>;
  counts: Record<string, number>;
  percentiles: Record<string, { p50: number; p95: number; p99: number }>;
}

export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  lastRender: number;
}

/**
 * Aggregates and processes performance metrics
 */
export class MetricsAggregator {
  private static instance: MetricsAggregator;
  private componentMetrics = new Map<string, ComponentMetric>();

  private constructor() {}

  public static getInstance(): MetricsAggregator {
    if (!MetricsAggregator.instance) {
      MetricsAggregator.instance = new MetricsAggregator();
    }
    return MetricsAggregator.instance;
  }

  /**
   * Aggregate performance entries into summary statistics
   */
  aggregateEntries(entries: PerformanceEntry[]): MetricsSummary {
    const grouped = this.groupEntriesByName(entries);
    const summary: MetricsSummary = {
      averages: {},
      totals: {},
      counts: {},
      percentiles: {},
    };

    Object.entries(grouped).forEach(([name, nameEntries]) => {
      const durations = nameEntries.map(entry => entry.duration).filter(d => d > 0);
      
      if (durations.length > 0) {
        summary.averages[name] = this.calculateAverage(durations);
        summary.totals[name] = this.calculateSum(durations);
        summary.counts[name] = durations.length;
        summary.percentiles[name] = this.calculatePercentiles(durations);
      }
    });

    return summary;
  }

  /**
   * Track component performance
   */
  trackComponent(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderTime = renderTime;
      existing.rerenderCount += 1;
      existing.lastRender = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        rerenderCount: 1,
        lastRender: Date.now(),
      });
    }
  }

  /**
   * Get component metrics
   */
  getComponentMetrics(): ComponentMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get slow components (render time > threshold)
   */
  getSlowComponents(threshold: number = 16): ComponentMetric[] {
    return this.getComponentMetrics().filter(metric => metric.renderTime > threshold);
  }

  /**
   * Clear component metrics
   */
  clearComponentMetrics(): void {
    this.componentMetrics.clear();
  }

  /**
   * Group entries by name
   */
  private groupEntriesByName(entries: PerformanceEntry[]): Record<string, PerformanceEntry[]> {
    return entries.reduce((groups, entry) => {
      if (!groups[entry.name]) {
        groups[entry.name] = [];
      }
      groups[entry.name].push(entry);
      return groups;
    }, {} as Record<string, PerformanceEntry[]>);
  }

  /**
   * Calculate average
   */
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate sum
   */
  private calculateSum(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Calculate percentiles
   */
  private calculatePercentiles(values: number[]): { p50: number; p95: number; p99: number } {
    const sorted = [...values].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: sorted[Math.floor(len * 0.5)] || 0,
      p95: sorted[Math.floor(len * 0.95)] || 0,
      p99: sorted[Math.floor(len * 0.99)] || 0,
    };
  }
}

export const metricsAggregator = MetricsAggregator.getInstance();
