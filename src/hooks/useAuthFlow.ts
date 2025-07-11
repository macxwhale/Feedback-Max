
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthWrapper";
import { AuthService } from "@/services/authService";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useInvitationProcessor } from "@/hooks/useInvitationProcessor";

export function useAuthFlow() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signUp, updatePassword } = useAuth();
  const passwordResetMutation = usePasswordReset();
  const { processInvitation, processing: invitationProcessing } = useInvitationProcessor();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log('Starting sign in process for:', email);
    
    // Check if this is an invitation flow
    const isInvitation = searchParams.get('invitation') === 'true';
    const orgSlug = searchParams.get('org');
    
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    toast({ 
      title: "Welcome back!", 
      description: "You have been signed in successfully." 
    });

    // Wait for auth state to settle before processing
    console.log('Sign in successful, waiting for session...');
    
    // Use a timeout to wait for the auth state to update
    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found, determining redirect path...');
          
          // If this is an invitation flow, process the invitation first
          if (isInvitation && orgSlug && email) {
            console.log('Invitation flow detected, processing invitation...');
            const result = await processInvitation(email, orgSlug, session.user.id);
            
            if (result.success) {
              // processInvitation handles the redirect
              setLoading(false);
              return;
            } else {
              // If invitation processing fails, show error and redirect to auth
              setError(result.error || 'Failed to process invitation');
              navigate('/auth?error=' + encodeURIComponent('Failed to process invitation'));
              setLoading(false);
              return;
            }
          }
          
          // For non-invitation flows, use the normal redirect logic
          const redirectPath = await AuthService.handlePostAuthRedirect(session.user);
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        } else {
          console.log('No session found after sign in, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Post-signin processing error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }, 1000); // Wait 1 second for auth state to settle
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const { error: signUpError } = await signUp(email, password);
    
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    toast({
      title: "Account created!",
      description: "Please check your email to verify your account.",
    });
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await passwordResetMutation.mutateAsync({ email });
      setShowForgotPassword(false);
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (newPassword: string) => {
    setLoading(true);
    setError("");
    
    const { error } = await updatePassword(newPassword);
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast({
      title: "Password updated!",
      description: "Your password has been successfully updated.",
    });
    
    // Check if this is an invitation flow for password reset
    const isInvitation = searchParams.get('invitation') === 'true';
    const orgSlug = searchParams.get('org');
    
    if (isInvitation && orgSlug && email) {
      // For invited users during password reset, process the invitation
      console.log('Processing invitation after password reset for:', email, 'to org:', orgSlug);
      
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const result = await processInvitation(email, orgSlug, session.user.id);
          
          if (!result.success) {
            setError(result.error || 'Failed to process invitation');
            navigate('/auth?error=' + encodeURIComponent('Failed to process invitation'));
          }
          // processInvitation handles the redirect on success
        } else {
          console.error('No session found after password reset');
          setError('Authentication error. Please try signing in.');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error processing invitation:', error);
        setError('Failed to process invitation');
        navigate('/auth?error=' + encodeURIComponent('Failed to process invitation'));
      }
    } else {
      // For regular password reset, redirect to dashboard
      console.log('Regular password reset, redirecting to dashboard');
      navigate('/');
    }
    
    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading: loading || passwordResetMutation.isPending || invitationProcessing,
    error,
    setError,
    showForgotPassword,
    setShowForgotPassword,
    handleSignIn,
    handleSignUp,
    handleForgotPassword,
    handleNewPassword,
    isPasswordReset: searchParams.get('reset') === 'true',
  };
}
