
import React from 'react';
import { useOrganizationConfig } from '@/hooks/useOrganizationConfig';

interface BrandedHeaderProps {
  title: string;
  subtitle: string;
  showSecureIndicator?: boolean;
}

export const BrandedHeader: React.FC<BrandedHeaderProps> = ({
  title,
  subtitle,
  showSecureIndicator = false
}) => {
  const { colors, logoAsset, organization } = useOrganizationConfig();

  const headerStyle = {
    background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`
  };

  const organizationName = organization?.name || "Pulsify";

  // Update default logo alt text and site name if fallback is triggered
  return (
    <div className="p-8 text-white text-center" style={headerStyle}>
      {logoAsset?.asset_url && (
        <img 
          src={logoAsset.asset_url}
          alt={logoAsset.asset_name || `${organizationName} Logo`}
          className="h-20 mx-auto mb-6 drop-shadow-lg object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/lovable-uploads/pulse-favicon-64.png';
            (e.target as HTMLImageElement).alt = 'Pulsify Logo';
          }}
        />
      )}
      <h1 className="text-4xl font-bold mb-3">
        {title === "Pulselify" ? "Pulsify" : title}
      </h1>
      <p className="text-xl text-blue-100">
        {subtitle === "Turn Customer Feedback Into Growth"
          ? "Real Insights. Real Impact."
          : subtitle}
      </p>
      {showSecureIndicator && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2 text-green-300">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Secure & Confidential</span>
          </div>
        </div>
      )}
    </div>
  );
};
