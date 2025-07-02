
/**
 * Invitation Cache Service
 * Handles caching logic with TTL management and cleanup
 */

import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/infrastructure/performance/PerformanceMonitor';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Dedicated cache management service for invitations
 */
export class InvitationCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Generate cache key from operation and parameters
   */
  getCacheKey(operation: string, params: Record<string, unknown>): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
    
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.cleanup();
    }
  }

  /**
   * Get cache entry if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || !this.isValidEntry(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (!this.isValidEntry(entry)) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    logger.debug('Cache cleanup completed', {
      expiredEntries: expiredKeys.length,
      remainingEntries: this.cache.size,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    logger.info('Invitation cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
  } {
    const summary = performanceMonitor.getPerformanceSummary();
    const cacheHits = summary.summary['invite_user_cache_hit'] || 0;
    const totalProcessed = summary.summary['invite_user_processed'] || 0;
    
    return {
      size: this.cache.size,
      hitRate: totalProcessed > 0 ? (cacheHits / (cacheHits + totalProcessed)) * 100 : 0,
    };
  }
}
