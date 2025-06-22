
import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationContextType {
  organization: any | null;
  loading: boolean;
  error: string | null;
  refreshOrganization: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};

const IGNORED_ROUTES = ['admin', 'auth', 'create-organization', 'login', 'terms-of-service', 'privacy-policy'];

const extractSlugFromPath = (pathname: string): string | null => {
  const pathParts = pathname.split('/').filter(p => p);

  // Handles routes like /admin/:slug/...
  if (pathParts[0] === 'admin' && pathParts.length > 1 && pathParts[1] !== 'login') {
    return pathParts[1];
  } 
  // Handles legacy /org/:slug
  else if (pathParts[0] === 'org' && pathParts.length > 1) {
    return pathParts[1];
  } 
  // Handles /:orgSlug for feedback, but ignores other top-level routes
  else if (pathParts.length > 0 && !IGNORED_ROUTES.includes(pathParts[0])) {
    return pathParts[0];
  }

  return null;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchOrganization = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const slug = extractSlugFromPath(location.pathname);

      if (!slug) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Organization not found');
        } else {
          setError(fetchError.message || 'Failed to load organization');
        }
        setOrganization(null);
      } else {
        setOrganization(data);
        setError(null);
      }
    } catch (catchError: any) {
      setError(catchError.message || 'An unexpected error occurred');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [location.pathname]);

  return (
    <OrganizationContext.Provider value={{
      organization,
      loading,
      error,
      refreshOrganization: fetchOrganization,
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};
