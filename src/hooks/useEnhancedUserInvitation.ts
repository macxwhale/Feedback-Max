
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
      
      try {
        const { data, error } = await supabase.functions.invoke('enhanced-invite-user', {
          body: {
            email: email.trim().toLowerCase(),
            organizationId,
            role,
            enhancedRole: enhancedRole || role
          }
        });

        // Handle network or function invocation errors
        if (error) {
          console.error('Enhanced invite function error:', error);
          // If it's a network error, provide a more user-friendly message
          if (error.message?.includes('Failed to send a request')) {
            throw new Error('Network connection issue. Please check your internet connection and try again.');
          }
          throw new Error(error.message || 'Failed to invite user');
        }

        // Handle successful response
        if (data && typeof data === 'object') {
          if (!data.success && data.error) {
            console.error('Invitation failed:', data.error);
            throw new Error(data.error);
          }
          return data as InviteUserResponse;
        }

        // Handle unexpected response format
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response from server');

      } catch (networkError: any) {
        console.error('Network or function call error:', networkError);
        
        // Handle specific network errors
        if (networkError.message?.includes('Failed to send a request')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }
        
        // Re-throw other errors as-is
        throw networkError;
      }
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
