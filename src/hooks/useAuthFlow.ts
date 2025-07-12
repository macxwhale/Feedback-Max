
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

  // Add error boundary for auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context not available:', error);
    // Provide fallback functions
    authContext = {
      signIn: async () => ({ error: { message: 'Authentication not available' } }),
      signUp: async () => ({ error: { message: 'Authentication not available' } }),
      updatePassword: async () => ({ error: { message: 'Authentication not available' } })
    };
  }

  const { signIn, signUp, updatePassword } = authContext;
  const passwordResetMutation = usePasswordReset();
  const { processInvitation, processing: invitationProcessing } = useInvitationProcessor();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log('=== SIGN IN FLOW START ===');
    console.log('Starting sign in process for:', email);
    
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
          
          // Use the normal redirect logic
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
    
    console.log('=== SIGN UP FLOW START ===');
    console.log('Starting sign up process for:', email);
    
    const { error: signUpError } = await signUp(email, password);
    
    if (signUpError) {
      console.error('Signup error:', signUpError);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    console.log('Signup successful');
    
    toast({
      title: "Account created!",
      description: "Account created! Please check your email to verify your account.",
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
    
    // For password reset, redirect to dashboard
    console.log('Password reset completed, redirecting to dashboard');
    navigate('/');
    
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
