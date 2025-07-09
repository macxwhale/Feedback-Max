/**
 * Performance Collector
 * Collects various performance metrics from the browser
 */

export interface NavigationMetrics {
  totalLoad: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
}

export interface PaintMetrics {
  'first-paint': number;
  'first-contentful-paint': number;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
  context?: Record<string, unknown>;
}

export class PerformanceCollector {
  private entries: PerformanceEntry[] = [];

  collectNavigationMetrics(): NavigationMetrics | null {
    if (typeof window === 'undefined' || !window.performance?.timing) {
      return null;
    }

    const timing = window.performance.timing;
    return {
      totalLoad: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstContentfulPaint: this.getFirstContentfulPaint()
    };
  }

  collectPaintMetrics(): PaintMetrics {
    const metrics: PaintMetrics = {
      'first-paint': 0,
      'first-contentful-paint': 0
    };

    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) {
      return metrics;
    }

    const paintEntries = window.performance.getEntriesByType('paint');
    
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        metrics['first-paint'] = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics['first-contentful-paint'] = entry.startTime;
      }
    });

    return metrics;
  }

  addEntry(entry: PerformanceEntry): void {
    this.entries.push(entry);
    
    // Keep only the last 1000 entries to prevent memory leaks
    if (this.entries.length > 1000) {
      this.entries = this.entries.slice(-1000);
    }
  }

  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  clearEntries(): void {
    this.entries = [];
  }

  private getFirstContentfulPaint(): number {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) {
      return 0;
    }

    const paintEntries = window.performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }
}

export const performanceCollector = new PerformanceCollector();
