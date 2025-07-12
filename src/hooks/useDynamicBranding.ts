
import { useState, useEffect } from 'react';
import { useOrganizationConfig } from '@/hooks/useOrganizationConfig';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
}

export interface BrandingAssets {
  logoUrl: string | null;
  logoAlt: string;
}

export interface DynamicBrandingResult {
  colors: BrandColors;
  assets: BrandingAssets;
  isLoading: boolean;
  organizationName: string;
  applyBrandingStyles: () => void;
}

export const useDynamicBranding = (): DynamicBrandingResult => {
  const { organization, logoAsset, colors: themeColors, isLoading } = useOrganizationConfig();
  const [appliedStyles, setAppliedStyles] = useState(false);

  // Default brand colors (Police Sacco fallback)
  const defaultColors: BrandColors = {
    primary: '#073763',
    secondary: '#007ACE', 
    accent: '#f97316',
    background: '#f8fafc',
    surface: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280'
  };

  // Merge theme colors with defaults
  const brandColors: BrandColors = {
    primary: themeColors.primary || defaultColors.primary,
    secondary: themeColors.secondary || defaultColors.secondary,
    accent: themeColors.accent || defaultColors.accent,
    background: themeColors.background || defaultColors.background,
    surface: themeColors.surface || defaultColors.surface,
    textPrimary: themeColors.text_primary || defaultColors.textPrimary,
    textSecondary: themeColors.text_secondary || defaultColors.textSecondary
  };

  // Get logo URL - prefer organization_assets, fallback to organization.logo_url
  const logoUrl = logoAsset?.asset_url || organization?.logo_url || '/lovable-uploads/367347fe-02da-4338-b8ba-91138293d303.png';
  
  const brandingAssets: BrandingAssets = {
    logoUrl,
    logoAlt: `${organization?.name || 'Organization'} Logo`
  };

  // Function to apply dynamic CSS custom properties
  const applyBrandingStyles = () => {
    if (typeof document === 'undefined' || appliedStyles) return;

    const root = document.documentElement;
    
    // Apply brand colors as CSS custom properties
    root.style.setProperty('--brand-primary', brandColors.primary);
    root.style.setProperty('--brand-secondary', brandColors.secondary);
    root.style.setProperty('--brand-accent', brandColors.accent);
    root.style.setProperty('--brand-background', brandColors.background);
    root.style.setProperty('--brand-surface', brandColors.surface);
    root.style.setProperty('--brand-text-primary', brandColors.textPrimary);
    root.style.setProperty('--brand-text-secondary', brandColors.textSecondary);

    // Create gradient combinations
    const primaryToAccent = `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})`;
    const primaryToSecondary = `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})`;
    
    root.style.setProperty('--brand-gradient-primary-accent', primaryToAccent);
    root.style.setProperty('--brand-gradient-primary-secondary', primaryToSecondary);

    setAppliedStyles(true);
  };

  // Apply styles when colors change
  useEffect(() => {
    if (!isLoading && organization) {
      applyBrandingStyles();
    }
  }, [brandColors.primary, brandColors.secondary, brandColors.accent, isLoading, organization]);

  return {
    colors: brandColors,
    assets: brandingAssets,
    isLoading,
    organizationName: organization?.name || 'Organization',
    applyBrandingStyles
  };
};
