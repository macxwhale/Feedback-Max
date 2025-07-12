
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PasswordResetParams {
  email: string;
}

interface PasswordResetResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const usePasswordReset = () => {
  return useMutation({
    mutationFn: async ({ email }: PasswordResetParams): Promise<PasswordResetResponse> => {
      console.log('Sending password reset request for:', email);
      
      try {
        const { data, error } = await supabase.functions.invoke('send-password-reset', {
          body: {
            email: email.trim().toLowerCase()
          }
        });

        console.log('Password reset function response:', { data, error });

        // Handle Supabase function invoke errors
        if (error) {
          console.error('Supabase function invoke error:', error);
          
          if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
            throw new Error('Network error: Please check your internet connection and try again');
          }
          
          if (error.message?.includes('FunctionsError') || error.message?.includes('non-2xx status code')) {
            const errorMessage = data?.error || 'Service error occurred. Please try again.';
            throw new Error(errorMessage);
          }
          
          throw new Error(error.message || 'Failed to send password reset request');
        }

        // Handle application-level errors from the function
        if (!data) {
          console.error('No data returned from password reset function');
          throw new Error('No response received from server');
        }

        // Type guard to check if data has success property
        if (typeof data === 'object' && data !== null && 'success' in data) {
          const response = data as PasswordResetResponse;
          
          if (response.success === false) {
            console.error('Password reset failed:', response.error);
            throw new Error(response.error || 'Failed to send password reset email');
          }

          console.log('Password reset successful:', response);
          return response;
        }

        // If data doesn't have expected structure, assume success
        console.log('Password reset completed with response:', data);
        return {
          success: true,
          message: 'Password reset email sent successfully'
        };
        
      } catch (error: any) {
        console.error('Password reset error:', error);
        const errorMessage = error.message || 'Failed to send password reset email. Please try again.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset email sent! Check your inbox for instructions.');
    },
    onError: (error: any) => {
      console.error('Password reset mutation error:', error);
      const errorMessage = error.message || 'Failed to send password reset email';
      toast.error(errorMessage);
    }
  });
};
