
/**
 * Core User Invitation Hook
 * Focused on single user invitation with optimized caching
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { usePerformanceTracking } from '@/infrastructure/performance/PerformanceMonitor';
import { OptimizedUserInvitationService } from '@/infrastructure/performance/OptimizedUserInvitationService';
import type { InviteUserRequest, InviteUserResult } from '@/domain/interfaces/IUserInvitationService';
import type { ApiResponse } from '@/utils/errorHandler';

const optimizedService = new OptimizedUserInvitationService();

/**
 * Core invitation hook with performance tracking and optimistic updates
 */
export const useInviteUser = () => {
  const queryClient = useQueryClient();
  const performance = usePerformanceTracking('useInviteUser');

  return useMutation({
    mutationFn: async (params: InviteUserRequest): Promise<InviteUserResult> => {
      const operationId = `invite_user_${Date.now()}`;
      performance.startTiming(operationId, 'invite_user_mutation');

      try {
        logger.info('Starting invitation process', {
          email: params.email,
          organizationId: params.organizationId,
          role: params.role,
        });

        const result = await optimizedService.inviteUser(params);
        
        if (!result.success) {
          const errorResponse = result as ApiResponse<never>;
          throw new Error(errorResponse.error?.message || 'Invitation failed');
        }

        performance.endTiming(operationId, 'invite_user_mutation', { success: true });
        return result.data!;
        
      } catch (error: unknown) {
        performance.endTiming(operationId, 'invite_user_mutation', { success: false });
        logger.error('Invitation failed', { error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },

    onMutate: async (variables: InviteUserRequest) => {
      await queryClient.cancelQueries({ 
        queryKey: ['organization-invitations', variables.organizationId] 
      });

      const previousInvitations = queryClient.getQueryData([
        'organization-invitations', 
        variables.organizationId
      ]);

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

    onSuccess: (data: InviteUserResult, variables: InviteUserRequest) => {
      const organizationQueries = [
        { queryKey: ['organization-members', variables.organizationId] },
        { queryKey: ['organization-invitations', variables.organizationId] },
      ];

      Promise.all(
        organizationQueries.map(({ queryKey }) =>
          queryClient.invalidateQueries({ queryKey })
        )
      );
      
      const message = data.type === 'direct_add'
        ? 'User added to organization successfully!'
        : 'Invitation sent successfully! The user will receive an email with instructions to join.';
      
      toast.success(message);
      logger.info('Invitation completed successfully', { type: data.type });
    },

    onError: (error: Error, variables: InviteUserRequest, context: any) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(
          ['organization-invitations', variables.organizationId],
          context.previousInvitations
        );
      }
      
      const errorMessage = error.message.includes('already exists')
        ? 'This user is already part of the organization.'
        : error.message.includes('not found')
        ? 'Organization not found. Please try again.'
        : error.message || 'Failed to invite user. Please try again.';

      toast.error(errorMessage);
      logger.error('Invitation mutation failed', { error: error.message });
    },
  });
};
