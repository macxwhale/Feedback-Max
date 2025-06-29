
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteUserParams {
  email: string;
  organizationId: string;
  role: string;
  enhancedRole?: string;
}

interface InviteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
  type?: 'direct_add' | 'invitation_sent';
}

export const useEnhancedInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, organizationId, role, enhancedRole }: InviteUserParams): Promise<InviteUserResponse> => {
      console.log('Sending invitation request:', { email, organizationId, role, enhancedRole });
      
      const { data, error } = await supabase.functions.invoke('enhanced-invite-user', {
        body: {
          email: email.trim().toLowerCase(),
          organizationId,
          role,
          enhancedRole: enhancedRole || role
        }
      });

      if (error) {
        console.error('Enhanced invite error:', error);
        throw new Error(error.message || 'Failed to invite user');
      }

      if (!data.success) {
        console.error('Invitation failed:', data.error);
        throw new Error(data.error || 'Failed to invite user');
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      
      if (data.type === 'direct_add') {
        toast.success('User added to organization successfully!');
      } else {
        toast.success('Invitation sent successfully! The user will receive an email with instructions to join.');
      }
    },
    onError: (error: any) => {
      console.error('Invitation mutation error:', error);
      toast.error(error.message || 'Failed to invite user');
    }
  });
};
