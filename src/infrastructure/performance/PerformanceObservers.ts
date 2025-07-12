
/**
 * Performance Observers
 * Manages browser performance observers and data collection
 */

import { logger } from '@/utils/logger';
import { performanceCollector } from './PerformanceCollector';

/**
 * Manages browser performance observers
 */
export class PerformanceObservers {
  private static instance: PerformanceObservers;
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PerformanceObservers {
    if (!PerformanceObservers.instance) {
      PerformanceObservers.instance = new PerformanceObservers();
    }
    return PerformanceObservers.instance;
  }

  /**
   * Initialize all performance observers
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.initializeLongTaskObserver();
      this.initializeNavigationObserver();
      this.initializePaintObserver();
      this.initializeResourceObserver();
      
      this.isInitialized = true;
      logger.info('Performance observers initialized');
    } catch (error) {
      logger.error('Failed to initialize performance observers', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Initialize long task observer
   */
  private initializeLongTaskObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          performanceCollector.addEntry({
            name: 'long-task',
            startTime: entry.startTime,
            duration: entry.duration,
            entryType: entry.entryType,
            context: { 
              attribution: (entry as any).attribution?.[0]?.name 
            },
          });

          // Log significant long tasks
          if (entry.duration > 50) {
            logger.warn('Long task detected', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      logger.warn('Long task observer not supported');
    }
  }

  /**
   * Initialize navigation observer
   */
  private initializeNavigationObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Record key navigation metrics
          const metrics = [
            { name: 'dns-lookup', value: navEntry.domainLookupEnd - navEntry.domainLookupStart },
            { name: 'tcp-connect', value: navEntry.connectEnd - navEntry.connectStart },
            { name: 'request-response', value: navEntry.responseEnd - navEntry.requestStart },
            { name: 'dom-processing', value: navEntry.domComplete - navEntry.responseEnd },
            { name: 'total-load', value: navEntry.loadEventEnd - navEntry.fetchStart },
          ];

          metrics.forEach((metric) => {
            if (metric.value > 0) {
              performanceCollector.addEntry({
                name: metric.name,
                startTime: navEntry.startTime,
                duration: metric.value,
                entryType: 'navigation',
              });
            }
          });
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      logger.warn('Navigation observer not supported');
    }
  }

  /**
   * Initialize paint observer
   */
  private initializePaintObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          performanceCollector.addEntry({
            name: entry.name,
            startTime: entry.startTime,
            duration: 0, // Paint entries don't have duration
            entryType: entry.entryType,
          });
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      logger.warn('Paint observer not supported');
    }
  }

  /**
   * Initialize resource observer
   */
  private initializeResourceObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Only track significant resources
          if (resourceEntry.duration > 100) {
            performanceCollector.addEntry({
              name: 'resource-load',
              startTime: resourceEntry.startTime,
              duration: resourceEntry.duration,
              entryType: resourceEntry.entryType,
              context: {
                url: resourceEntry.name,
                size: resourceEntry.transferSize,
                type: resourceEntry.initiatorType,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      logger.warn('Resource observer not supported');
    }
  }

  /**
   * Cleanup all observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
    this.isInitialized = false;
    logger.info('Performance observers cleaned up');
  }
}

export const performanceObservers = PerformanceObservers.getInstance();
