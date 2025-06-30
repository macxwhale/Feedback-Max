import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { createAuthRedirectUrl } from '@/utils/authUtils';

export class AuthService {
  private static getBaseUrl(): string {
    // Use the current window location for consistency
    return window.location.origin;
  }

  static async signUp(email: string, password: string) {
    try {
      const redirectUrl = createAuthRedirectUrl('/auth-callback?type=signup');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  static async resetPassword(email: string) {
    try {
      // Use the custom password reset function instead of the built-in one
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        console.error('Password reset error:', error);
        return { data: null, error: error as AuthError };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { data, error };
    } catch (error) {
      console.error('Update password error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  static async signOut() {
    try {
      // Clean up any stored auth state
      this.cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload to ensure clean state
      window.location.href = '/auth';
      
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even on error
      window.location.href = '/auth';
      return { error: error as AuthError };
    }
  }

  static cleanupAuthState() {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  static async handlePostAuthRedirect(user: any) {
    try {
      console.log('Determining redirect path for user:', user.email);
      
      // Add a delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for existing organization membership with retries
      let userOrgs = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!userOrgs && attempts < maxAttempts) {
        attempts++;
        console.log(`Checking organization membership, attempt ${attempts}`);
        
        const { data, error } = await supabase
          .from('organization_users')
          .select('organization_id, organizations(slug)')
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) {
          console.error('Error checking organization membership:', error);
        }
        
        if (data && data.length > 0) {
          userOrgs = data;
          break;
        }
        
        // Wait a bit before retrying
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (userOrgs && userOrgs.length > 0) {
        const orgSlug = userOrgs[0].organizations?.slug;
        if (orgSlug) {
          console.log('User has organization, redirecting to:', `/admin/${orgSlug}`);
          return `/admin/${orgSlug}`;
        }
      }

      // Check if user is system admin
      const { data: isAdmin, error: adminError } = await supabase.rpc("get_current_user_admin_status");
      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }
      
      if (isAdmin) {
        console.log('User is system admin, redirecting to:', '/admin');
        return "/admin";
      }

      // Default to organization creation for authenticated users without organizations
      console.log('No organization found, redirecting to:', '/create-organization');
      return '/create-organization';
    } catch (error) {
      console.error('Post-auth redirect error:', error);
      return '/create-organization';
    }
  }
}
