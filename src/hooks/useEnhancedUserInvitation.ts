
/**
 * Enhanced User Invitation Hook
 * React Query integration with the refactored service layer
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { userInvitationApplicationService } from '@/application/services/UserInvitationApplicationService';
import type { InviteUserRequest, InviteUserResult } from '@/domain/interfaces/IUserInvitationService';
import type { ApiResponse } from '@/utils/errorHandler';

/**
 * Enhanced user invitation hook with comprehensive error handling
 * Following React Query best practices and Clean Architecture
 */
export const useEnhancedInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: InviteUserRequest): Promise<InviteUserResult> => {
      logger.info('useEnhancedInviteUser: Starting invitation process', {
        email: params.email,
        organizationId: params.organizationId,
        role: params.role,
        enhancedRole: params.enhancedRole,
      });

      try {
        const result = await userInvitationApplicationService.inviteUser(params);
        
        // Type guard to check if result is an error response
        if (!result.success) {
          const errorResponse = result as ApiResponse<never>;
          throw new Error(errorResponse.error?.message || 'Invitation failed');
        }

        return result.data!;
        
      } catch (error: unknown) {
        logger.error('useEnhancedInviteUser: Invitation failed', {
          error: error instanceof Error ? error.message : String(error),
          params,
        });
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to invite user. Please try again.';
        throw new Error(errorMessage);
      }
    },

    onSuccess: (data: InviteUserResult) => {
      // Invalidate relevant queries following React Query best practices
      const queryKeysToInvalidate = [
        { queryKey: ['organization-members'] },
        { queryKey: ['organization-invitations'] },
      ];

      queryKeysToInvalidate.forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Provide user-friendly success feedback
      const message = data.type === 'direct_add'
        ? 'User added to organization successfully!'
        : 'Invitation sent successfully! The user will receive an email with instructions to join.';
      
      toast.success(message);
      
      logger.info('useEnhancedInviteUser: Invitation completed successfully', {
        type: data.type,
        message: data.message,
      });
    },

    onError: (error: Error) => {
      logger.error('useEnhancedInviteUser: Invitation mutation failed', {
        error: error.message,
      });
      
      // Show user-friendly error message
      toast.error(error.message || 'Failed to invite user');
    },
  });
};

/**
 * Hook for cancelling invitations
 */
export const useEnhancedCancelInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string): Promise<void> => {
      logger.info('useEnhancedCancelInvitation: Cancelling invitation', {
        invitationId,
      });

      const result = await userInvitationApplicationService.cancelInvitation(invitationId);
      
      if (!result.success) {
        const errorResponse = result as ApiResponse<never>;
        throw new Error(errorResponse.error?.message || 'Failed to cancel invitation');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      toast.success('Invitation cancelled successfully');
      
      logger.info('useEnhancedCancelInvitation: Invitation cancelled successfully');
    },

    onError: (error: Error) => {
      logger.error('useEnhancedCancelInvitation: Cancellation failed', {
        error: error.message,
      });
      
      toast.error(error.message || 'Failed to cancel invitation');
    },
  });
};
