
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useOrganizationConfig } from '@/hooks/useOrganizationConfig';

export const EnhancedLoading: React.FC = () => {
  const { colors } = useOrganizationConfig();

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${colors.primary}1A 0%, ${colors.secondary}1A 50%, ${colors.accent}1A 100%)`
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          <Loader2 
            className="h-16 w-16 animate-spin mx-auto"
            style={{ color: colors.accent }} 
          />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: colors.primary }}>
          Loading Your Feedback Form
        </h3>
        <p className="text-gray-600 animate-pulse">
          Preparing your personalized experience...
        </p>
        <div className="mt-4 flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: colors.accent,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
