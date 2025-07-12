
/**
 * Optimized User Invitation Service (Refactored)
 * Composed from focused service components following SRP
 */

import { logger } from '@/utils/logger';
import { PerformanceLogger } from '@/infrastructure/logging/PerformanceLogger';
import { performanceMonitor } from '@/infrastructure/performance/PerformanceMonitor';
import { UserInvitationService } from '@/services/userInvitationService';
import { InvitationCacheService } from '@/infrastructure/services/InvitationCacheService';
import { BatchProcessingService } from '@/infrastructure/services/BatchProcessingService';
import { InvitationValidationService } from '@/infrastructure/services/InvitationValidationService';
import type {
  IUserInvitationService,
  InviteUserRequest,
  InviteUserResult,
  CancelInvitationRequest,
  ResendInvitationRequest,
} from '@/domain/interfaces/IUserInvitationService';
import type { ApiResponse } from '@/utils/errorHandler';

/**
 * Enhanced User Invitation Service with performance optimizations
 * Uses composition of focused services for better maintainability
 */
export class OptimizedUserInvitationService implements IUserInvitationService {
  private readonly baseService: UserInvitationService;
  private readonly cacheService: InvitationCacheService;
  private readonly batchService: BatchProcessingService;
  private readonly validationService: InvitationValidationService;

  constructor(baseService?: UserInvitationService) {
    this.baseService = baseService || new UserInvitationService();
    this.cacheService = new InvitationCacheService();
    this.batchService = new BatchProcessingService();
    this.validationService = new InvitationValidationService();
  }

  /**
   * Optimized invite user with caching and validation
   */
  async inviteUser(request: InviteUserRequest): Promise<ApiResponse<InviteUserResult>> {
    const operationId = `invite_user_${Date.now()}_${Math.random()}`;
    PerformanceLogger.startTiming(operationId, 'optimized_invite_user');

    try {
      // Validate request
      const validation = this.validationService.validateInvitationRequest(request);
      if (!validation.isValid) {
        PerformanceLogger.endTiming(operationId, 'optimized_invite_user', { 
          validation: false 
        });
        return {
          success: false,
          error: validation.errors[0]
        };
      }

      // Check cache
      const cacheKey = this.cacheService.getCacheKey('invite_user', {
        email: request.email,
        organizationId: request.organizationId,
      });
      
      const cachedResult = this.cacheService.get<ApiResponse<InviteUserResult>>(cacheKey);
      if (cachedResult) {
        performanceMonitor.recordMetric({
          name: 'invite_user_cache_hit',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
        });
        
        PerformanceLogger.endTiming(operationId, 'optimized_invite_user', { cached: true });
        return cachedResult;
      }

      // Process invitation
      const result = await this.baseService.inviteUser(request);
      
      // Cache successful results
      if (result.success) {
        this.cacheService.set(cacheKey, result);
      }

      // Record metrics
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
      PerformanceLogger.endTiming(operationId, 'optimized_invite_user', { error: true });
      throw error;
    }
  }

  /**
   * Batch invitation processing using BatchProcessingService
   */
  async inviteUsersBatch(requests: InviteUserRequest[]): Promise<ApiResponse<InviteUserResult>[]> {
    const operationId = `invite_users_batch_${Date.now()}`;
    PerformanceLogger.startTiming(operationId, 'invite_users_batch');

    try {
      // Validate batch
      const validation = this.validationService.validateBatchRequest(requests);
      if (!validation.isValid) {
        PerformanceLogger.endTiming(operationId, 'invite_users_batch', { validation: false });
        return validation.errors.map(error => ({
          success: false,
          error
        }));
      }

      logger.info('Processing batch invitation', { batchSize: requests.length });

      const results = await this.batchService.processInvitationBatch(
        requests,
        (request) => this.inviteUser(request)
      );

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
      PerformanceLogger.endTiming(operationId, 'invite_users_batch', { error: true });
      throw error;
    }
  }

  /**
   * Cancel invitation with cache invalidation
   */
  async cancelInvitation(request: CancelInvitationRequest): Promise<ApiResponse<void>> {
    const operationId = `cancel_invitation_${Date.now()}`;
    PerformanceLogger.startTiming(operationId, 'optimized_cancel_invitation');

    try {
      // Validate request
      const validation = this.validationService.validateCancellationRequest(request);
      if (!validation.isValid) {
        PerformanceLogger.endTiming(operationId, 'optimized_cancel_invitation', { 
          validation: false 
        });
        return {
          success: false,
          error: validation.errors[0]
        };
      }

      const result = await this.baseService.cancelInvitation(request);
      
      // Invalidate related cache entries
      this.invalidateRelatedCache(request.invitationId);

      performanceMonitor.recordMetric({
        name: 'invitation_cancelled',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
      });

      PerformanceLogger.endTiming(operationId, 'optimized_cancel_invitation');
      return result;

    } catch (error) {
      PerformanceLogger.endTiming(operationId, 'optimized_cancel_invitation', { error: true });
      throw error;
    }
  }

  /**
   * Resend invitation
   */
  async resendInvitation(request: ResendInvitationRequest): Promise<ApiResponse<InviteUserResult>> {
    const operationId = `resend_invitation_${Date.now()}`;
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
      PerformanceLogger.endTiming(operationId, 'optimized_resend_invitation', { error: true });
      throw error;
    }
  }

  /**
   * Get performance statistics from cache service
   */
  getPerformanceStats() {
    const cacheStats = this.cacheService.getStats();
    const summary = performanceMonitor.getPerformanceSummary();
    
    return {
      cacheSize: cacheStats.size,
      cacheHitRate: cacheStats.hitRate,
      totalInvitations: summary.summary['invite_user_processed'] || 0,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cacheService.clear();
    performanceMonitor.clearMetrics();
  }

  /**
   * Invalidate cache entries related to an invitation
   */
  private invalidateRelatedCache(invitationId: string): void {
    // This would need more sophisticated cache key tracking in a real implementation
    // For now, we'll do a simple cleanup
    this.cacheService.cleanup();
  }
}

/**
 * Factory function for creating optimized service
 */
export const createOptimizedUserInvitationService = (): OptimizedUserInvitationService => {
  return new OptimizedUserInvitationService();
};
