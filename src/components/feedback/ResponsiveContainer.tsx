
import React from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useDynamicBranding } from '@/hooks/useDynamicBranding';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = ''
}) => {
  const { isMobile, isTablet } = useMobileDetection();
  const { colors } = useDynamicBranding();

  const containerClasses = `
    ${isMobile ? 'px-4 py-2' : isTablet ? 'px-6 py-4' : 'px-8 py-6'}
    ${isMobile ? 'max-w-full' : isTablet ? 'max-w-3xl' : 'max-w-4xl'}
    mx-auto min-h-screen
    ${className}
  `;

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.secondary}08 50%, ${colors.accent}08 100%)`
  };

  return (
    <div className={containerClasses} style={backgroundStyle}>
      {children}
    </div>
  );
};
