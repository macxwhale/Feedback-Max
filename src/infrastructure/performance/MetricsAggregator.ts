
/**
 * Metrics Aggregator
 * Aggregates and stores performance metrics
 */

export interface PerformanceSnapshot {
  timestamp: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  renderTime: number;
  componentCount: number;
}

export interface MetricsSummary {
  averages: Record<string, number>;
  totals: Record<string, number>;
  counts: Record<string, number>;
  percentiles: Record<string, number>;
}

export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRender: number;
}

export class MetricsAggregator {
  private static snapshots: PerformanceSnapshot[] = [];
  private static maxSnapshots = 100;

  static captureSnapshot(): PerformanceSnapshot {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage(),
      renderTime: performance.now(),
      componentCount: this.getComponentCount()
    };

    this.snapshots.push(snapshot);
    
    // Keep only the last maxSnapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    return snapshot;
  }

  static getRecentSnapshots(count = 10): PerformanceSnapshot[] {
    return this.snapshots.slice(-count);
  }

  private static getMemoryUsage() {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return undefined;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize || 0,
      total: memory.totalJSHeapSize || 0,
      limit: memory.jsHeapSizeLimit || 0
    };
  }

  private static getComponentCount(): number {
    // Simple heuristic: count DOM elements with React-like attributes
    if (typeof document === 'undefined') return 0;
    
    return document.querySelectorAll('[data-reactroot], [data-react-*]').length || 
           document.querySelectorAll('div, span, button, input').length;
  }
}
