
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

    // Redirect will be handled by auth state change
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
