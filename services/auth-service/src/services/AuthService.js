
const { createClient } = require('@supabase/supabase-js');

class AuthService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async signUp(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}/auth-callback?type=signup`
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut({ scope: 'global' });
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  async refreshSession(refreshToken) {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      return { data, error };
    } catch (error) {
      console.error('Refresh session error:', error);
      return { data: null, error };
    }
  }

  async resetPassword(email) {
    try {
      const { data, error } = await this.supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      return { data, error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  }

  async updatePassword(newPassword) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      return { data, error };
    } catch (error) {
      console.error('Update password error:', error);
      return { data: null, error };
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('organization_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('organization_users')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
}

module.exports = { AuthService };
