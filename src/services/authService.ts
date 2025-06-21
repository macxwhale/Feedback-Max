
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export class AuthService {
  private static getBaseUrl(): string {
    // Use the current window location for consistency
    return window.location.origin;
  }

  private static getRedirectUrl(path: string = '/auth-callback'): string {
    return `${this.getBaseUrl()}${path}`;
  }

  static async signUp(email: string, password: string) {
    try {
      const redirectUrl = this.getRedirectUrl('?type=signup');
      
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
      const redirectUrl = this.getRedirectUrl('?type=recovery');
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      return { data, error };
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
      // Check for existing organization membership
      const { data: userOrgs } = await supabase
        .from('organization_users')
        .select('organization_id, organizations(slug)')
        .eq('user_id', user.id)
        .limit(1);

      if (userOrgs && userOrgs.length > 0) {
        const orgSlug = userOrgs[0].organizations?.slug;
        if (orgSlug) {
          return `/admin/${orgSlug}`;
        }
      }

      // Check if user is system admin
      const { data: isAdmin } = await supabase.rpc("get_current_user_admin_status");
      if (isAdmin) {
        return "/admin";
      }

      // Default to organization creation
      return '/create-organization';
    } catch (error) {
      console.error('Post-auth redirect error:', error);
      return '/create-organization';
    }
  }
}
