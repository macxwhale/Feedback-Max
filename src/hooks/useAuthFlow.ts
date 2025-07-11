
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthWrapper";
import { AuthService } from "@/services/authService";
import { usePasswordReset } from "@/hooks/usePasswordReset";

export function useAuthFlow() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signUp, updatePassword } = useAuth();
  const passwordResetMutation = usePasswordReset();
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

    // Wait for auth state to settle before redirecting
    console.log('Sign in successful, waiting for session...');
    
    // Use a timeout to wait for the auth state to update
    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found, determining redirect path...');
          
          // If this is an invitation flow, skip the default redirect
          // The invitation processing will handle the redirect
          if (isInvitation && orgSlug) {
            console.log('Invitation flow detected, skipping default redirect');
            setLoading(false);
            return;
          }
          
          const redirectPath = await AuthService.handlePostAuthRedirect(session.user);
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        } else {
          console.log('No session found after sign in, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Post-signin redirection error:', error);
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
    
    // Check if this is an invitation flow
    const isInvitation = searchParams.get('invitation') === 'true';
    const orgSlug = searchParams.get('org');
    
    if (isInvitation && orgSlug && email) {
      // For invited users, process the invitation after password is set
      console.log('Processing invitation after password reset for:', email, 'to org:', orgSlug);
      
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get organization details
          const { data: organization } = await supabase
            .from('organizations')
            .select('id, name, slug')
            .eq('slug', orgSlug)
            .single();

          if (!organization) {
            console.error('Organization not found:', orgSlug);
            setError('Organization not found');
            setLoading(false);
            return;
          }

          // Check if user is already in organization
          const { data: existingMembership } = await supabase
            .from('organization_users')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('organization_id', organization.id)
            .maybeSingle();

          if (!existingMembership) {
            // Get invitation details to determine role
            const { data: invitation } = await supabase
              .from('user_invitations')
              .select('role, enhanced_role')
              .eq('email', email.toLowerCase().trim())
              .eq('organization_id', organization.id)
              .eq('status', 'pending')
              .single();

            const role = invitation?.role || 'member';
            const enhancedRole = invitation?.enhanced_role || 'member';

            // Add user to organization with proper typing
            const { error: addError } = await supabase
              .from('organization_users')
              .insert({
                user_id: session.user.id,
                organization_id: organization.id,
                email: email,
                role: role,
                enhanced_role: enhancedRole as "owner" | "admin" | "manager" | "analyst" | "member" | "viewer",
                status: 'active',
                accepted_at: new Date().toISOString()
              });

            if (addError) {
              console.error('Error adding user to organization:', addError);
              setError('Failed to join organization');
              setLoading(false);
              return;
            }

            // Mark invitation as accepted
            await supabase
              .from('user_invitations')
              .update({ 
                status: 'accepted',
                updated_at: new Date().toISOString()
              })
              .eq('email', email.toLowerCase().trim())
              .eq('organization_id', organization.id);

            console.log('User successfully added to organization');
          } else {
            console.log('User already in organization');
          }

          // Add a delay to ensure database consistency before redirect
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Redirect to organization dashboard
          console.log('Redirecting to organization dashboard:', orgSlug);
          navigate(`/admin/${orgSlug}`);
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
    loading: loading || passwordResetMutation.isPending,
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
