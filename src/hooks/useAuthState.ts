
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const checkUserRoles = async (userId: string) => {
  try {
    console.log('Checking user roles for:', userId);
    
    // Add a small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data: adminStatus, error: adminError } = await supabase
      .rpc('get_current_user_admin_status');
    
    if (adminError) {
      console.error('Error checking admin status:', adminError);
    }
    
    // Get organization data with enhanced role
    const { data: orgData, error: orgError } = await supabase
      .from('organization_users')
      .select('organization_id, role, enhanced_role, organizations(slug)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (orgError && orgError.code !== 'PGRST116') {
      console.error('Error checking org memberships:', orgError);
    }

    const isAdmin = !!adminStatus;
    const hasOrgRole = !!orgData?.organization_id;

    console.log('User roles determined:', { 
      isAdmin, 
      hasOrgRole, 
      orgData,
      enhancedRole: orgData?.enhanced_role 
    });

    return {
      isAdmin,
      isOrgAdmin: hasOrgRole,
      currentOrganization: orgData?.organization_id || null,
      currentOrganizationSlug: (orgData?.organizations as any)?.slug || null,
    };
  } catch (error) {
    console.error('Error checking user roles:', error);
    return {
      isAdmin: false,
      isOrgAdmin: false,
      currentOrganization: null,
      currentOrganizationSlug: null,
    };
  }
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<string | null>(null);
  const [currentOrganizationSlug, setCurrentOrganizationSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let roleCheckTimeout: NodeJS.Timeout;

    const updateUserRoles = async (userId: string) => {
      try {
        const roles = await checkUserRoles(userId);
        if (mounted) {
          setIsAdmin(roles.isAdmin);
          setIsOrgAdmin(roles.isOrgAdmin);
          setCurrentOrganization(roles.currentOrganization);
          setCurrentOrganizationSlug(roles.currentOrganizationSlug);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error updating user roles:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change in useAuthState:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear any pending role checks
        if (roleCheckTimeout) {
          clearTimeout(roleCheckTimeout);
        }
        
        if (session?.user) {
          // Use setTimeout to prevent potential deadlocks and ensure proper sequencing
          roleCheckTimeout = setTimeout(() => {
            if (mounted) {
              updateUserRoles(session.user.id);
            }
          }, 200); // Increased delay for better reliability
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
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (mounted) {
        console.log('Initial session check:', existingSession?.user?.email);
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          updateUserRoles(existingSession.user.id);
        } else {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (roleCheckTimeout) {
        clearTimeout(roleCheckTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);
  
  return { 
    user, 
    session, 
    isAdmin, 
    isOrgAdmin, 
    currentOrganization, 
    currentOrganizationSlug, 
    loading 
  };
};
