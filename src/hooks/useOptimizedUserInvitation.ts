
/**
 * Optimized User Invitation Hook
 * Performance-enhanced version with intelligent caching and request optimization
 */

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { usePerformanceTracking } from '@/infrastructure/performance/PerformanceMonitor';
import { OptimizedUserInvitationService } from '@/infrastructure/performance/OptimizedUserInvitationService';
import type { InviteUserRequest, InviteUserResult } from '@/domain/interfaces/IUserInvitationService';
import type { ErrorResponse } from '@/utils/errorHandler';

// Singleton service instance
const optimizedService = new OptimizedUserInvitationService();

/**
 * Optimized invitation hook with performance tracking
 */
export const useOptimizedInviteUser = () => {
  const queryClient = useQueryClient();
  const performance = usePerformanceTracking('useOptimizedInviteUser');

  return useMutation({
    mutationFn: async (params: InviteUserRequest): Promise<InviteUserResult> => {
      const operationId = `invite_user_mutation_${Date.now()}`;
      performance.startTiming(operationId, 'invite_user_mutation');

      try {
        logger.info('Starting optimized invitation process', {
          email: params.email,
          organizationId: params.organizationId,
          role: params.role,
          enhancedRole: params.enhancedRole,
        });

        const result = await optimizedService.inviteUser(params);
        
        if (!result.success) {
          const errorResponse = result as ErrorResponse;
          throw new Error(errorResponse.error.message);
        }

        performance.endTiming(operationId, 'invite_user_mutation', {
          success: true,
        });

        return result.data;
        
      } catch (error: unknown) {
        performance.endTiming(operationId, 'invite_user_mutation', {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });

        logger.error('Optimized invitation failed', {
          error: error instanceof Error ? error.message : String(error),
          params,
        });
        
        throw error;
      }
    },

    onSuccess: (data: InviteUserResult, variables: InviteUserRequest) => {
      // Intelligent cache invalidation
      const organizationQueries = [
        { queryKey: ['organization-members', variables.organizationId] },
        { queryKey: ['organization-invitations', variables.organizationId] },
      ];

      // Batch invalidate queries
      Promise.all(
        organizationQueries.map(({ queryKey }) =>
          queryClient.invalidateQueries({ queryKey })
        )
      ).then(() => {
        logger.debug('Cache invalidation completed', {
          invalidatedQueries: organizationQueries.length,
        });
      });
      
      // Smart success messaging
      const message = data.type === 'direct_add'
        ? 'User added to organization successfully!'
        : 'Invitation sent successfully! The user will receive an email with instructions to join.';
      
      toast.success(message);
      
      logger.info('Optimized invitation completed successfully', {
        type: data.type,
        message: data.message,
        organizationId: variables.organizationId,
      });
    },

    onError: (error: Error, variables: InviteUserRequest) => {
      logger.error('Optimized invitation mutation failed', {
        error: error.message,
        variables,
      });
      
      // Smart error messaging
      const errorMessage = error.message.includes('already exists')
        ? 'This user is already part of the organization.'
        : error.message.includes('not found')
        ? 'Organization not found. Please try again.'
        : error.message || 'Failed to invite user. Please try again.';

      toast.error(errorMessage);
    },

    // Optimistic update configuration
    onMutate: async (variables: InviteUserRequest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['organization-invitations', variables.organizationId] 
      });

      // Snapshot previous value
      const previousInvitations = queryClient.getQueryData([
        'organization-invitations', 
        variables.organizationId
      ]);

      // Optimistically update with new invitation
      if (previousInvitations) {
        const optimisticInvitation = {
          id: `temp-${Date.now()}`,
          email: variables.email,
          role: variables.role,
          enhanced_role: variables.enhancedRole,
          status: 'pending',
          created_at: new Date().toISOString(),
          organization_id: variables.organizationId,
        };

        queryClient.setQueryData(
          ['organization-invitations', variables.organizationId],
          (old: any[]) => [...(old || []), optimisticInvitation]
        );
      }

      return { previousInvitations };
    },

    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousInvitations) {
        queryClient.setQueryData(
          ['organization-invitations', variables.organizationId],
          context.previousInvitations
        );
      }
    },
  });
};

/**
 * Batch invitation hook for multiple users
 */
export const useBatchInviteUsers = () => {
  const queryClient = useQueryClient();
  const performance = usePerformanceTracking('useBatchInviteUsers');

  return useMutation({
    mutationFn: async (requests: InviteUserRequest[]): Promise<InviteUserResult[]> => {
      const operationId = `batch_invite_users_${Date.now()}`;
      performance.startTiming(operationId, 'batch_invite_users');

      try {
        const results = await optimizedService.inviteUsersBatch(requests);
        const successfulResults = results
          .filter(result => result.success)
          .map(result => result.data as InviteUserResult);

        performance.endTiming(operationId, 'batch_invite_users', {
          totalRequests: requests.length,
          successfulInvitations: successfulResults.length,
        });

        return successfulResults;

      } catch (error) {
        performance.endTiming(operationId, 'batch_invite_users', {
          error: true,
        });
        throw error;
      }
    },

    onSuccess: (results: InviteUserResult[], variables: InviteUserRequest[]) => {
      // Get unique organization IDs for cache invalidation
      const organizationIds = [...new Set(variables.map(req => req.organizationId))];
      
      // Invalidate queries for all affected organizations
      organizationIds.forEach(orgId => {
        queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
        queryClient.invalidateQueries({ queryKey: ['organization-invitations', orgId] });
      });

      toast.success(
        `Successfully processed ${results.length} of ${variables.length} invitations`
      );

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

/**
 * Hook for performance statistics
 */
export const useInvitationPerformanceStats = () => {
  return useQuery({
    queryKey: ['invitation-performance-stats'],
    queryFn: () => optimizedService.getPerformanceStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
};

/**
 * Clear invitation cache
 */
export const useClearInvitationCache = () => {
  return useMutation({
    mutationFn: async () => {
      optimizedService.clearCache();
      return true;
    },
    onSuccess: () => {
      toast.success('Invitation cache cleared successfully');
    },
  });
};
