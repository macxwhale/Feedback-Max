
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Shield, Star } from 'lucide-react';
import { BrandedHeader } from './BrandedHeader';
import { BrandedButton } from './BrandedButton';
import { useOrganizationConfig } from '@/hooks/useOrganizationConfig';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { colors, welcomeTitle, welcomeDescription } = useOrganizationConfig();

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.secondary}22 50%, ${colors.accent}22 100%)`
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
      <Card className="max-w-2xl w-full shadow-2xl border-0 overflow-hidden">
        <BrandedHeader
          title={welcomeTitle}
          subtitle={welcomeDescription}
        />
        
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.secondary}20` }}>
                <Clock className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primary }}>Quick & Easy</h3>
                <p className="text-sm text-gray-600">Takes only 3-5 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                <Shield className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primary }}>Confidential</h3>
                <p className="text-sm text-gray-600">Your privacy is protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.primary}20` }}>
                <Users className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primary }}>Your Voice Matters</h3>
                <p className="text-sm text-gray-600">Every response helps improve our services</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                <Star className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primary }}>Make a Difference</h3>
                <p className="text-sm text-gray-600">Shape the future of our services</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <BrandedButton
              onClick={onStart}
              size="lg"
              className="px-12 py-4 text-lg"
            >
              Start Feedback Survey
            </BrandedButton>
            <p className="text-sm mt-4 text-gray-600">
              Your responses are anonymous and help us improve our services
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
