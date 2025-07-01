
/**
 * Optimized User Invitation Service
 * Performance-enhanced version with caching, batching, and monitoring
 */

import { logger } from '@/utils/logger';
import { PerformanceLogger } from '@/infrastructure/logging/PerformanceLogger';
import { performanceMonitor } from '@/infrastructure/performance/PerformanceMonitor';
import { UserInvitationService } from '@/services/userInvitationService';
import type {
  IUserInvitationService,
  InviteUserRequest,
  InviteUserResult,
  CancelInvitationRequest,
  ResendInvitationRequest,
} from '@/domain/interfaces/IUserInvitationService';
import type { ApiResponse } from '@/utils/errorHandler';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Enhanced User Invitation Service with performance optimizations
 * Implements caching, request batching, and comprehensive monitoring
 */
export class OptimizedUserInvitationService implements IUserInvitationService {
  private cache = new Map<string, CacheEntry<any>>();
  private batchQueue: InviteUserRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly baseService: UserInvitationService;

  // Configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 100; // 100ms

  constructor(baseService?: UserInvitationService) {
    this.baseService = baseService || new UserInvitationService();
  }

  /**
   * Cache management utilities
   */
  private getCacheKey(operation: string, params: Record<string, unknown>): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  private isValidCacheEntry<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
    
    // Cleanup old entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || !this.isValidCacheEntry(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (!this.isValidCacheEntry(entry)) {
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
   * Optimized invite user with caching and batching
   */
  async inviteUser(request: InviteUserRequest): Promise<ApiResponse<InviteUserResult>> {
    const operationId = `invite_user_${Date.now()}_${Math.random()}`;
    PerformanceLogger.startTiming(operationId, 'optimized_invite_user');

    try {
      // Check cache first
      const cacheKey = this.getCacheKey('invite_user', {
        email: request.email,
        organizationId: request.organizationId,
      });
      
      const cachedResult = this.getCache<ApiResponse<InviteUserResult>>(cacheKey);
      if (cachedResult) {
        performanceMonitor.recordMetric({
          name: 'invite_user_cache_hit',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
        });
        
        PerformanceLogger.endTiming(operationId, 'optimized_invite_user', {
          cached: true,
        });
        
        return cachedResult;
      }

      // Process the invitation
      const result = await this.baseService.inviteUser(request);
      
      // Cache successful results
      if (result.success) {
        this.setCache(cacheKey, result, this.CACHE_TTL);
      }

      // Record performance metrics
      performanceMonitor.recordMetric({
        name: 'invite_user_processed',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        context: {
          organizationId: request.organizationId,
          role: request.role,
        },
      });

      PerformanceLogger.endTiming(operationId, 'optimized_invite_user', {
        cached: false,
        success: result.success,
      });

      return result;

    } catch (error) {
      PerformanceLogger.endTiming(operationId, 'optimized_invite_user', {
        error: true,
      });
      throw error;
    }
  }

  /**
   * Batch invitation processing
   */
  async inviteUsersBatch(requests: InviteUserRequest[]): Promise<ApiResponse<InviteUserResult>[]> {
    const operationId = `invite_users_batch_${Date.now()}_${Math.random()}`;
    PerformanceLogger.startTiming(operationId, 'invite_users_batch');

    try {
      logger.info('Processing batch invitation', {
        batchSize: requests.length,
      });

      // Process invitations in parallel with concurrency limit
      const concurrencyLimit = 5;
      const results: ApiResponse<InviteUserResult>[] = [];
      
      for (let i = 0; i < requests.length; i += concurrencyLimit) {
        const batch = requests.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(request => this.inviteUser(request));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            logger.error('Batch invitation failed', {
              request: batch[index],
              error: result.reason,
            });
          }
        });
      }

      performanceMonitor.recordMetric({
        name: 'batch_invitations_processed',
        value: requests.length,
        unit: 'count',
        timestamp: Date.now(),
      });

      PerformanceLogger.endTiming(operationId, 'invite_users_batch', {
        batchSize: requests.length,
        successCount: results.filter(r => r.success).length,
      });

      return results;

    } catch (error) {
      PerformanceLogger.endTiming(operationId, 'invite_users_batch', {
        error: true,
      });
      throw error;
    }
  }

  /**
   * Optimized cancel invitation
   */
  async cancelInvitation(request: CancelInvitationRequest): Promise<ApiResponse<void>> {
    const operationId = `cancel_invitation_${Date.now()}_${Math.random()}`;
    PerformanceLogger.startTiming(operationId, 'optimized_cancel_invitation');

    try {
      const result = await this.baseService.cancelInvitation(request);
      
      // Invalidate related cache entries
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.includes('invite_user') && key.includes(request.invitationId)) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => this.cache.delete(key));

      performanceMonitor.recordMetric({
        name: 'invitation_cancelled',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
      });

      PerformanceLogger.endTiming(operationId, 'optimized_cancel_invitation', {
        cacheInvalidations: keysToDelete.length,
      });

      return result;

    } catch (error) {
      PerformanceLogger.endTiming(operationId, 'optimized_cancel_invitation', {
        error: true,
      });
      throw error;
    }
  }

  /**
   * Optimized resend invitation
   */
  async resendInvitation(request: ResendInvitationRequest): Promise<ApiResponse<InviteUserResult>> {
    const operationId = `resend_invitation_${Date.now()}_${Math.random()}`;
    PerformanceLogger.startTiming(operationId, 'optimized_resend_invitation');

    try {
      const result = await this.baseService.resendInvitation(request);

      performanceMonitor.recordMetric({
        name: 'invitation_resent',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
      });

      PerformanceLogger.endTiming(operationId, 'optimized_resend_invitation');

      return result;

    } catch (error) {
      PerformanceLogger.endTiming(operationId, 'optimized_resend_invitation', {
        error: true,
      });
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    cacheSize: number;
    cacheHitRate: number;
    totalInvitations: number;
  } {
    const summary = performanceMonitor.getPerformanceSummary();
    const cacheHits = summary.summary['invite_user_cache_hit'] || 0;
    const totalProcessed = summary.summary['invite_user_processed'] || 0;
    
    return {
      cacheSize: this.cache.size,
      cacheHitRate: totalProcessed > 0 ? (cacheHits / (cacheHits + totalProcessed)) * 100 : 0,
      totalInvitations: totalProcessed,
    };
  }

  /**
   * Clear all caches and reset performance counters
   */
  clearCache(): void {
    this.cache.clear();
    performanceMonitor.clearMetrics();
    logger.info('Cache and performance metrics cleared');
  }
}

/**
 * Factory function for creating optimized service
 */
export const createOptimizedUserInvitationService = (): OptimizedUserInvitationService => {
  return new OptimizedUserInvitationService();
};
