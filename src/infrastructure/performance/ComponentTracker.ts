
import React from 'react';

/**
 * Component Performance Tracker
 * Tracks React component render times and re-renders
 */

interface ComponentMetric {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  timestamp: number;
  props?: Record<string, unknown>;
}

class ComponentTrackerClass {
  private metrics: ComponentMetric[] = [];
  private renderCounts = new Map<string, number>();

  trackRender(componentName: string, renderTime: number, props?: Record<string, unknown>): void {
    const currentCount = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, currentCount + 1);

    this.metrics.push({
      componentName,
      renderTime,
      rerenderCount: currentCount + 1,
      timestamp: Date.now(),
      props: props ? { ...props } : undefined,
    });

    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  getMetrics(): ComponentMetric[] {
    return [...this.metrics];
  }

  getComponentSummary(): Record<string, { 
    avgRenderTime: number; 
    totalRenders: number; 
    maxRenderTime: number;
  }> {
    const summary: Record<string, { times: number[]; count: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.componentName]) {
        summary[metric.componentName] = { times: [], count: 0 };
      }
      summary[metric.componentName].times.push(metric.renderTime);
      summary[metric.componentName].count++;
    });

    const result: Record<string, { avgRenderTime: number; totalRenders: number; maxRenderTime: number }> = {};
    
    Object.entries(summary).forEach(([name, data]) => {
      const times = data.times;
      result[name] = {
        avgRenderTime: times.reduce((a, b) => a + b, 0) / times.length,
        totalRenders: data.count,
        maxRenderTime: Math.max(...times),
      };
    });

    return result;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.renderCounts.clear();
  }
}

export const ComponentTracker = new ComponentTrackerClass();

// React hook for tracking component performance
export const useComponentTracker = (componentName: string, props?: Record<string, unknown>) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      ComponentTracker.trackRender(componentName, endTime - startTime, props);
    };
  });
};
