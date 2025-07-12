
import React from 'react';
import { useOrganizationConfig } from '@/hooks/useOrganizationConfig';

export const FeedbackHeader: React.FC = () => {
  const { organization, colors, headerTitle, headerSubtitle } = useOrganizationConfig();

  if (!organization) return null;

  return (
    <div className="relative mb-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl opacity-50" />
      
      <div className="relative text-center py-4 px-6">
        <div className="space-y-2">
          <h1 
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` 
            }}
          >
            {headerTitle}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {headerSubtitle}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Secure & Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
};
