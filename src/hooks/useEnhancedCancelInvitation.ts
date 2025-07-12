
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancedCancelInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string): Promise<void> => {
      logger.info('useEnhancedCancelInvitation: Cancelling invitation', {
        invitationId,
      });

      // Get invitation details first
      const { data: invitation, error: fetchError } = await supabase
        .from('user_invitations')
        .select('email, organization_id')
        .eq('id', invitationId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch invitation details');
      }

      // Start a transaction-like approach
      // First, remove from user_invitations
      const { error: invitationError } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (invitationError) {
        throw new Error('Failed to cancel invitation');
      }

      // Then, remove from organization_users if exists (for cases where user was added directly)
      const { error: userError } = await supabase
        .from('organization_users')
        .delete()
        .eq('email', invitation.email)
        .eq('organization_id', invitation.organization_id);

      // Don't throw error for user removal as it might not exist
      if (userError) {
        logger.warn('Could not remove user from organization_users (may not exist)', {
          email: invitation.email,
          organizationId: invitation.organization_id,
        });
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      toast.success('Invitation cancelled and user removed successfully');
      
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
