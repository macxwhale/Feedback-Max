
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isOrgAdmin: boolean;
  currentOrganization: string | null;
  currentOrganizationSlug: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<string | null>(null);
  const [currentOrganizationSlug, setCurrentOrganizationSlug] = useState<string | null>(null);

  const checkUserRoles = async (userId: string) => {
    try {
      console.log('Checking user roles for:', userId);
      
      const { data: adminStatus, error: adminError } = await supabase
        .rpc('get_current_user_admin_status');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }
      
      const { data: orgData, error: orgError } = await supabase
        .from('organization_users')
        .select('organization_id, role, organizations(slug)')
        .eq('user_id', userId)
        .single();
      
      if (orgError && orgError.code !== 'PGRST116') {
        console.error('Error checking org memberships:', orgError);
      }

      const adminStatus_bool = !!adminStatus;
      const hasOrgRole = !!orgData?.organization_id;

      setIsAdmin(adminStatus_bool);
      setIsOrgAdmin(hasOrgRole);
      setCurrentOrganization(orgData?.organization_id || null);
      setCurrentOrganizationSlug((orgData?.organizations as any)?.slug || null);
    } catch (error) {
      console.error('Error checking user roles:', error);
      setIsAdmin(false);
      setIsOrgAdmin(false);
      setCurrentOrganization(null);
      setCurrentOrganizationSlug(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role checking to prevent potential deadlocks
          setTimeout(async () => {
            if (mounted) {
              await checkUserRoles(session.user.id);
              setLoading(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setIsOrgAdmin(false);
          setCurrentOrganization(null);
          setCurrentOrganizationSlug(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkUserRoles(session.user.id).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Clean up any existing auth state
    AuthService.cleanupAuthState();
    
    const result = await AuthService.signIn(email, password);
    
    if (!result.error && result.data?.user) {
      // Let the auth state change handler manage the loading state
    } else {
      setLoading(false);
    }
    
    return result;
  };

  const signUp = async (email: string, password: string) => {
    return await AuthService.signUp(email, password);
  };

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return await AuthService.updatePassword(newPassword);
  };

  const signOut = async () => {
    await AuthService.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isOrgAdmin,
        currentOrganization,
        currentOrganizationSlug,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
