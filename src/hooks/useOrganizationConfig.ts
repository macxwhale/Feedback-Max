
import { useState, useEffect } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { getOrganizationAssets, getOrganizationTheme } from '@/services/organizationAssets';
import type { OrganizationAsset, OrganizationTheme } from '@/services/organizationService.types';

export interface OrganizationConfig {
  assets: OrganizationAsset[];
  theme: OrganizationTheme | null;
  logoAsset: OrganizationAsset | null;
}

export const useOrganizationConfig = () => {
  const { organization } = useOrganization();
  const [config, setConfig] = useState<OrganizationConfig>({
    assets: [],
    theme: null,
    logoAsset: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      if (!organization) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const [assets, theme] = await Promise.all([
          getOrganizationAssets(organization.id),
          getOrganizationTheme(organization.id)
        ]);

        const logoAsset = assets.find(asset => asset.asset_type === 'logo') || null;

        setConfig({
          assets,
          theme,
          logoAsset
        });
      } catch (error) {
        console.error('Error loading organization config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [organization]);

  return {
    ...config,
    isLoading,
    organization,
    // Helper getters for common values with Police Sacco defaults
    colors: config.theme?.colors || {
      primary: organization?.primary_color || '#073763',
      secondary: organization?.secondary_color || '#007ACE',
      accent: '#f97316'
    },
    flowConfig: organization?.flow_configuration || {},
    headerTitle: organization?.feedback_header_title || 'Share Your Experience',
    headerSubtitle: organization?.feedback_header_subtitle || 'Help us serve you better with your valuable feedback',
    welcomeTitle: organization?.welcome_screen_title || 'Share Your Experience',
    welcomeDescription: organization?.welcome_screen_description || 'Help us serve you better with your valuable feedback. Your input helps us improve our services and better serve our community.',
    thankYouTitle: organization?.thank_you_title || 'Thank You for Your Feedback!',
    thankYouMessage: organization?.thank_you_message || 'Your valuable feedback has been received and will help us improve our services.'
  };
};
