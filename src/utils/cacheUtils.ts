
/**
 * Cache Utilities
 * Common caching patterns and utilities
 */

/**
 * Generic cache with TTL support
 */
export class TTLCache<T = any> {
  private cache = new Map<string, { data: T; expires: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expires });
  }

  /**
   * Get cache entry
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expires) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need hit tracking
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    this.cache.forEach((entry, key) => {
      size += key.length * 2; // Rough estimate for string keys
      size += JSON.stringify(entry.data).length * 2; // Rough estimate for data
    });
    return size;
  }
}

/**
 * Create cache key from object
 */
export const createCacheKey = (
  prefix: string,
  params: Record<string, unknown>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, unknown>);
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

/**
 * Memoization utility with TTL
 */
export const memoizeWithTTL = <T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5 * 60 * 1000
): T => {
  const cache = new TTLCache(ttl);
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

/**
 * LRU Cache implementation
 */
export class LRUCache<T = any> {
  private cache = new Map<string, T>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    if (!this.cache.has(key)) {
      return null;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Cache invalidation patterns
 */
export const CacheInvalidationStrategy = {
  /**
   * Tag-based invalidation
   */
  createTaggedCache: <T = any>() => {
    const cache = new Map<string, T>();
    const tags = new Map<string, Set<string>>();

    return {
      set: (key: string, value: T, cacheTags: string[] = []) => {
        cache.set(key, value);
        cacheTags.forEach(tag => {
          if (!tags.has(tag)) {
            tags.set(tag, new Set());
          }
          tags.get(tag)!.add(key);
        });
      },
      
      get: (key: string): T | null => {
        return cache.get(key) || null;
      },
      
      invalidateTag: (tag: string) => {
        const keys = tags.get(tag);
        if (keys) {
          keys.forEach(key => cache.delete(key));
          tags.delete(tag);
        }
      },
      
      clear: () => {
        cache.clear();
        tags.clear();
      }
    };
  }
};
