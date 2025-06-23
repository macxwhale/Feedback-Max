
import { supabase } from '@/integrations/supabase/client';
import type { Organization } from './organizationService.types';

const isValidSlug = (slug: string): boolean => {
  // Check if slug looks like a valid organization slug
  // Reject known system paths and invalid patterns
  const invalidSlugs = ['auth-callback', 'auth', 'admin', 'api', 'callback', 'login', 'signup'];
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  
  return (
    slug &&
    slug.length >= 2 &&
    slug.length <= 50 &&
    !invalidSlugs.includes(slug) &&
    slugPattern.test(slug)
  );
};

export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
  try {
    console.log('getOrganizationBySlug - Fetching slug:', slug);
    
    // Validate slug before making database query
    if (!isValidSlug(slug)) {
      console.log('getOrganizationBySlug - Invalid slug format:', slug);
      return null;
    }
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('getOrganizationBySlug - Supabase error:', error);
      return null;
    }

    // If organization found, ensure logo URL is properly set
    if (data && data.logo_storage_path && !data.logo_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(data.logo_storage_path);
      
      // Update the organization with the public URL
      await supabase
        .from('organizations')
        .update({ logo_url: publicUrl })
        .eq('id', data.id);
      
      data.logo_url = publicUrl;
    }

    console.log('getOrganizationBySlug - Result:', data);
    return data;
  } catch (error) {
    console.error('getOrganizationBySlug - Network error:', error);
    
    // Return fallback data for police-sacco if network fails
    if (slug === 'police-sacco') {
      console.log('getOrganizationBySlug - Returning fallback police-sacco data');
      return {
        id: 'fallback-police-sacco',
        name: 'Kenya National Police DT SACCO',
        slug: 'police-sacco',
        primary_color: '#073763',
        secondary_color: '#007ACE',
        is_active: true,
        logo_url: '/lovable-uploads/367347fe-02da-4338-b8ba-91138293d303.png',
        feedback_header_title: 'Share Your Experience',
        feedback_header_subtitle: 'Help us serve you better with your valuable feedback',
        welcome_screen_title: 'Share Your Experience',
        welcome_screen_description: 'Help us serve you better with your valuable feedback. Your input helps us improve our services and better serve our community.',
        thank_you_title: 'Thank You for Your Feedback!',
        thank_you_message: 'Your valuable feedback has been received and will help us improve our services.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return null;
  }
};

export const getOrganizationByDomain = async (domain: string): Promise<Organization | null> => {
  try {
    console.log('getOrganizationByDomain - Fetching domain:', domain);
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('domain', domain)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('getOrganizationByDomain - Supabase error:', error);
      return null;
    }

    console.log('getOrganizationByDomain - Result:', data);
    return data;
  } catch (error) {
    console.error('getOrganizationByDomain - Network error:', error);
    return null;
  }
};

export const getAllOrganizations = async (): Promise<Organization[]> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
};
