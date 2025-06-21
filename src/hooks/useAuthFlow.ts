import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthWrapper";

export function useAuthFlow() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
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

    // Handle post-signin redirection
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check for existing organization membership
        const { data: userOrgs } = await supabase
          .from('organization_users')
          .select('organization_id, organizations(slug)')
          .eq('user_id', session.user.id)
          .limit(1);

        if (userOrgs && userOrgs.length > 0) {
          const orgSlug = userOrgs[0].organizations?.slug;
          console.log('Redirecting to organization dashboard:', orgSlug);
          navigate(`/admin/${orgSlug}`);
        } else {
          console.log('No organization context found, checking admin status');
          
          // Check if user is system admin
          const { data: isAdmin } = await supabase.rpc("get_current_user_admin_status");
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate('/create-organization');
          }
        }
      }
    } catch (error) {
      console.error('Post-signin redirection error:', error);
      // Fallback to home page if redirection fails
      navigate('/');
    }
    
    setLoading(false);
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
    
    const { error: resetError } = await resetPassword(email);
    
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    toast({
      title: "Password reset sent!",
      description: "Check your email for password reset instructions.",
    });
    
    setShowForgotPassword(false);
    setLoading(false);
  };

  const handleNewPassword = async (newPassword: string) => {
    setLoading(true);
    setError("");
    
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast({
      title: "Password updated!",
      description: "Your password has been successfully updated.",
    });
    
    // Redirect to dashboard
    navigate('/');
    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
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
