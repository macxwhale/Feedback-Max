
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

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchOrganization = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pathParts = location.pathname.split('/').filter(p => p);

      let slug = "";
      // Handles routes like /admin/:slug/...
      if (pathParts[0] === 'admin' && pathParts.length > 1 && pathParts[1] !== 'login') {
        slug = pathParts[1];
      } 
      // Handles legacy /org/:slug
      else if (pathParts[0] === 'org' && pathParts.length > 1) {
        slug = pathParts[1];
      } 
      // Handles /:orgSlug for feedback, but ignores other top-level routes
      else if (pathParts.length > 0 && !['admin', 'auth', 'create-organization', 'login', 'terms-of-service', 'privacy-policy'].includes(pathParts[0])) {
        slug = pathParts[0];
      }

      if (!slug) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      console.log(`[OrganizationContext] Fetching organization with slug: ${slug}`);

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          console.log(`[OrganizationContext] Organization not found for slug: ${slug}`);
          setError('Organization not found');
        } else {
          console.error("OrganizationContext: Error fetching organization:", error);
          setError(error.message || 'Failed to load organization');
        }
        setOrganization(null);
      } else {
        console.log(`[OrganizationContext] Organization loaded successfully:`, data?.name);
        setOrganization(data);
        setError(null);
      }
    } catch (catchError: any) {
      console.error("OrganizationContext: Exception fetching organization:", catchError);
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
