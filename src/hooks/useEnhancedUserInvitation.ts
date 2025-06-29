
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

        // Handle Supabase function invoke errors (network/infrastructure issues)
        if (error) {
          console.error('Supabase function invoke error:', error);
          
          // Check for specific error types
          if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
            throw new Error('Network error: Please check your internet connection and try again');
          }
          
          if (error.message?.includes('FunctionsError')) {
            throw new Error('Service temporarily unavailable. Please try again in a moment');
          }
          
          throw new Error(error.message || 'Failed to send invitation request');
        }

        // Handle application-level errors from the function
        if (!data) {
          console.error('No data returned from invitation function');
          throw new Error('No response received from server');
        }

        // Check if the response indicates failure
        if (data.success === false) {
          console.error('Invitation failed:', data.error);
          throw new Error(data.error || 'Failed to invite user');
        }

        console.log('Invitation successful:', data);
        return data;
      } catch (error: any) {
        console.error('Enhanced invite error:', error);
        // Re-throw with a more user-friendly message if needed
        throw new Error(error.message || 'Failed to invite user');
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
      const errorMessage = error.message || 'Failed to invite user';
      toast.error(errorMessage);
    }
  });
};
