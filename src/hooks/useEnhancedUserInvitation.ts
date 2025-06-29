
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

        console.log('Function response:', { data, error });

        // Handle Supabase function invoke errors (network/infrastructure issues)
        if (error) {
          console.error('Supabase function invoke error:', error);
          
          // Check for specific error types
          if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
            throw new Error('Network error: Please check your internet connection and try again');
          }
          
          if (error.message?.includes('FunctionsError') || error.message?.includes('non-2xx status code')) {
            // Try to extract more meaningful error from the response
            const errorMessage = data?.error || 'Service error occurred. Please try again.';
            throw new Error(errorMessage);
          }
          
          throw new Error(error.message || 'Failed to send invitation request');
        }

        // Handle application-level errors from the function
        if (!data) {
          console.error('No data returned from invitation function');
          throw new Error('No response received from server');
        }

        // Type guard to check if data has success property
        if (typeof data === 'object' && data !== null && 'success' in data) {
          const response = data as InviteUserResponse;
          
          // Check if the response indicates failure
          if (response.success === false) {
            console.error('Invitation failed:', response.error);
            throw new Error(response.error || 'Failed to invite user');
          }

          console.log('Invitation successful:', response);
          return response;
        }

        // If data doesn't have expected structure, assume success
        console.log('Invitation completed with response:', data);
        return {
          success: true,
          message: 'Invitation processed successfully',
          type: 'invitation_sent'
        };
        
      } catch (error: any) {
        console.error('Enhanced invite error:', error);
        // Re-throw with a more user-friendly message if needed
        const errorMessage = error.message || 'Failed to invite user. Please try again.';
        throw new Error(errorMessage);
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
