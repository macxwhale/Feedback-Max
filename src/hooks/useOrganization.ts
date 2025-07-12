
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import type { Organization } from '@/services/organizationService.types';
import { getOrganizationBySlug, getOrganizationByDomain } from '@/services/organizationQueries';

export const useOrganization = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ slug?: string; orgSlug?: string }>();
  const location = useLocation();

  useEffect(() => {
    const detectOrganization = async () => {
      const currentPath = location.pathname;
      console.log('useOrganization - Starting detection for path:', currentPath);
      setIsLoading(true);
      setError(null);
      setOrganization(null);

      let org: Organization | null = null;
      
      // Get slug from router params. This is the primary way to identify an org from the path.
      const slugFromParams = params.orgSlug || params.slug;

      // Define special top-level routes that shouldn't be treated as organization slugs.
      const specialRoutes = ['admin', 'auth', 'login', 'create-organization', 'terms-of-service', 'privacy-policy'];

      if (slugFromParams && specialRoutes.includes(slugFromParams)) {
        console.log(`useOrganization - Path matched special route "${slugFromParams}", skipping org detection.`);
        setIsLoading(false);
        return;
      }
      
      // --- Org Detection Logic ---
      
      const url = new URL(window.location.href);
      const hostname = url.hostname;

      // Method 1: Check for custom domain (skip in development)
      if (hostname !== 'localhost' && !hostname.includes('lovable.app') && !hostname.includes('lovableproject.com')) {
        console.log('useOrganization - Checking domain:', hostname);
        try {
          org = await getOrganizationByDomain(hostname);
          console.log('useOrganization - Domain result:', org);
        } catch (domainError) {
          console.warn('useOrganization - Domain check failed:', domainError);
        }
      }

      // Method 2: Check for subdomain
      if (!org && hostname.includes('.')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain !== 'www' && subdomain !== 'feedback' && !subdomain.includes('preview--')) {
          console.log('useOrganization - Checking subdomain:', subdomain);
          try {
            org = await getOrganizationBySlug(subdomain);
            console.log('useOrganization - Subdomain result:', org);
          } catch (subdomainError) {
            console.warn('useOrganization - Subdomain check failed:', subdomainError);
          }
        }
      }

      // Method 3: Check for slug from URL path if no org found yet
      if (!org && slugFromParams) {
        console.log('useOrganization - Checking slug from params:', slugFromParams);
        try {
          org = await getOrganizationBySlug(slugFromParams);
          console.log('useOrganization - Slug result:', org);
        } catch (slugError) {
          console.error('useOrganization - Slug check failed:', slugError);
        }
      }

      // Method 4: Default to a fallback for the root path if no organization is found
      if (!org && currentPath === '/') {
        console.log('useOrganization - No org found, defaulting to police-sacco for root path');
        try {
          org = await getOrganizationBySlug('police-sacco');
          console.log('useOrganization - Default police-sacco result:', org);
        } catch (defaultError) {
          console.error('useOrganization - Default police-sacco failed:', defaultError);
        }
      }

      // --- Final State Update ---
      
      setOrganization(org);
      
      // Set an error only if a slug was present in the URL but no organization was found.
      const wasExpectingOrg = slugFromParams && !specialRoutes.includes(slugFromParams);
      if (!org && wasExpectingOrg) {
        console.log('useOrganization - No organization found for slug:', slugFromParams);
        setError('Organization not found');
      }
      
      setIsLoading(false);
      console.log('useOrganization - Detection finished. Final org:', org?.name || 'none');
    };

    detectOrganization();
  }, [params.slug, params.orgSlug, location.pathname]);

  return { organization, isLoading, error };
};
