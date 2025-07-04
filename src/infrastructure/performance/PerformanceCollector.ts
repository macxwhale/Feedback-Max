
/**
 * Performance Data Collector
 * Handles raw performance data collection from browser APIs
 */

import { logger } from '@/utils/logger';

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
  context?: Record<string, unknown>;
}

export interface NavigationMetrics {
  dnsLookup: number;
  tcpConnect: number;
  requestResponse: number;
  domProcessing: number;
  totalLoad: number;
}

/**
 * Collects performance data from various browser APIs
 */
export class PerformanceCollector {
  private static instance: PerformanceCollector;
  private entries: PerformanceEntry[] = [];

  private constructor() {}

  public static getInstance(): PerformanceCollector {
    if (!PerformanceCollector.instance) {
      PerformanceCollector.instance = new PerformanceCollector();
    }
    return PerformanceCollector.instance;
  }

  /**
   * Collect navigation timing data
   */
  collectNavigationMetrics(): NavigationMetrics | null {
    if (typeof window === 'undefined') return null;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return null;

      return {
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        requestResponse: navigation.responseEnd - navigation.requestStart,
        domProcessing: navigation.domComplete - navigation.responseEnd,
        totalLoad: navigation.loadEventEnd - navigation.fetchStart,
      };
    } catch (error) {
      logger.error('Failed to collect navigation metrics', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Collect paint timing data
   */
  collectPaintMetrics(): Record<string, number> {
    if (typeof window === 'undefined') return {};

    try {
      const paintEntries = performance.getEntriesByType('paint');
      const metrics: Record<string, number> = {};

      paintEntries.forEach((entry) => {
        metrics[entry.name] = entry.startTime;
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to collect paint metrics', { error: error instanceof Error ? error.message : String(error) });
      return {};
    }
  }

  /**
   * Collect long task data
   */
  collectLongTasks(): PerformanceEntry[] {
    return this.entries.filter(entry => entry.entryType === 'longtask');
  }

  /**
   * Add performance entry
   */
  addEntry(entry: PerformanceEntry): void {
    this.entries.push(entry);
    
    // Keep entries bounded
    if (this.entries.length > 500) {
      this.entries = this.entries.slice(-250);
    }
  }

  /**
   * Get all collected entries
   */
  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all entries
   */
  clearEntries(): void {
    this.entries = [];
  }
}

export const performanceCollector = PerformanceCollector.getInstance();
