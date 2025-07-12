
/**
 * Batch Invitations Hook
 * Handles multiple user invitations with concurrency control
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { usePerformanceTracking } from '@/infrastructure/performance/PerformanceMonitor';
import { OptimizedUserInvitationService } from '@/infrastructure/performance/OptimizedUserInvitationService';
import type { InviteUserRequest, InviteUserResult } from '@/domain/interfaces/IUserInvitationService';

const optimizedService = new OptimizedUserInvitationService();

/**
 * Batch invitation hook for processing multiple invitations efficiently
 */
export const useBatchInvitations = () => {
  const queryClient = useQueryClient();
  const performance = usePerformanceTracking('useBatchInvitations');

  return useMutation({
    mutationFn: async (requests: InviteUserRequest[]): Promise<InviteUserResult[]> => {
      const operationId = `batch_invite_${Date.now()}`;
      performance.startTiming(operationId, 'batch_invitations');

      try {
        logger.info('Starting batch invitation process', { batchSize: requests.length });

        const results = await optimizedService.inviteUsersBatch(requests);
        const successfulResults: InviteUserResult[] = [];
        
        results.forEach(result => {
          if (result.success && 'data' in result) {
            successfulResults.push(result.data);
          }
        });

        performance.endTiming(operationId, 'batch_invitations', {
          totalRequests: requests.length,
          successfulInvitations: successfulResults.length,
        });

        return successfulResults;

      } catch (error) {
        performance.endTiming(operationId, 'batch_invitations', { error: true });
        logger.error('Batch invitation failed', { error });
        throw error;
      }
    },

    onSuccess: (results: InviteUserResult[], variables: InviteUserRequest[]) => {
      const organizationIds = [...new Set(variables.map(req => req.organizationId))];
      
      organizationIds.forEach(orgId => {
        queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
        queryClient.invalidateQueries({ queryKey: ['organization-invitations', orgId] });
      });

      const successMessage = results.length === variables.length
        ? `Successfully invited ${results.length} users`
        : `Successfully processed ${results.length} of ${variables.length} invitations`;

      toast.success(successMessage);
      logger.info('Batch invitations completed', {
        totalRequests: variables.length,
        successful: results.length,
        organizations: organizationIds.length,
      });
    },

    onError: (error: Error) => {
      logger.error('Batch invitation failed', { error: error.message });
      toast.error('Failed to process batch invitations. Please try again.');
    },
  });
};
