
/**
 * Batch Processing Service
 * Handles concurrent processing with rate limiting
 */

import { logger } from '@/utils/logger';
import { PerformanceLogger } from '@/infrastructure/logging/PerformanceLogger';
import { createError, createErrorResponse, ERROR_CODES, type ApiResponse, type AppError } from '@/utils/errorHandler';
import type { InviteUserRequest, InviteUserResult } from '@/domain/interfaces/IUserInvitationService';

/**
 * Service for processing batch operations with concurrency control
 */
export class BatchProcessingService {
  private readonly DEFAULT_CONCURRENCY_LIMIT = 5;
  private readonly DEFAULT_BATCH_SIZE = 10;

  /**
   * Process invitations in batches with concurrency control
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: {
      concurrencyLimit?: number;
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<Array<{ success: boolean; result?: R; error?: Error; item: T }>> {
    
    const {
      concurrencyLimit = this.DEFAULT_CONCURRENCY_LIMIT,
      batchSize = this.DEFAULT_BATCH_SIZE,
      onProgress
    } = options;

    const operationId = `batch_process_${Date.now()}`;
    PerformanceLogger.startTiming(operationId, 'batch_processing');

    const results: Array<{ success: boolean; result?: R; error?: Error; item: T }> = [];
    let completed = 0;

    try {
      logger.info('Starting batch processing', {
        totalItems: items.length,
        concurrencyLimit,
        batchSize,
      });

      for (let i = 0; i < items.length; i += concurrencyLimit) {
        const batch = items.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(async (item) => {
          try {
            const result = await processor(item);
            completed++;
            onProgress?.(completed, items.length);
            return { success: true, result, item };
          } catch (error) {
            completed++;
            onProgress?.(completed, items.length);
            logger.warn('Batch item processing failed', { item, error });
            return { 
              success: false, 
              error: error instanceof Error ? error : new Error(String(error)), 
              item 
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const successCount = results.filter(r => r.success).length;
      
      PerformanceLogger.endTiming(operationId, 'batch_processing', {
        totalItems: items.length,
        successCount,
        failureCount: items.length - successCount,
      });

      logger.info('Batch processing completed', {
        totalItems: items.length,
        successCount,
        failureCount: items.length - successCount,
      });

      return results;

    } catch (error) {
      PerformanceLogger.endTiming(operationId, 'batch_processing', { error: true });
      logger.error('Batch processing failed', { error });
      throw error;
    }
  }

  /**
   * Process invitation batch specifically
   */
  async processInvitationBatch(
    requests: InviteUserRequest[],
    inviteProcessor: (request: InviteUserRequest) => Promise<ApiResponse<InviteUserResult>>
  ): Promise<ApiResponse<InviteUserResult>[]> {
    
    const results = await this.processBatch(
      requests,
      inviteProcessor,
      {
        onProgress: (completed, total) => {
          logger.debug('Invitation batch progress', { completed, total });
        }
      }
    );

    return results.map(result => {
      if (result.success && result.result) {
        return result.result;
      } else {
        // Create proper error response using error handling utilities
        const appError = createError(
          ERROR_CODES.SERVER_ERROR,
          result.error?.message || 'Unknown batch processing error',
          'medium'
        );
        return createErrorResponse(appError);
      }
    });
  }
}
