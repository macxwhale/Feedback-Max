import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import { AuthService } from '@/services/authService';
import { createAuthRedirectUrl } from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isOrgAdmin: boolean;
  currentOrganization: string | null;
  currentOrganizationSlug: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  refreshUserRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuthState();

  const signIn = async (email: string, password: string) => {
    console.log('Starting sign in process');
    
    // Clean up any existing auth state first
    AuthService.cleanupAuthState();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful, waiting for auth state update');
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Check if this is an invitation signup by looking at current URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const isInvitation = urlParams.get('invitation') === 'true';
      const orgSlug = urlParams.get('org');
      
      let redirectUrl = createAuthRedirectUrl('/auth-callback?type=signup');
      
      // If this is an invitation signup, preserve the invitation parameters
      if (isInvitation && orgSlug) {
        console.log('Invitation signup detected, preserving parameters');
        redirectUrl = createAuthRedirectUrl(`/auth-callback?type=signup&invitation=true&org=${orgSlug}`);
      }
      
      console.log('Using redirect URL for signup:', redirectUrl);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use the AuthService which now calls our custom function
      return await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      AuthService.cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even on error
      window.location.href = '/auth';
    }
  };

  const refreshUserRoles = async () => {
    if (authState.user) {
      // This will trigger a re-check of user roles
      console.log('Refreshing user roles for:', authState.user.id);
      // The useAuthState hook will handle the role checking
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshUserRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
