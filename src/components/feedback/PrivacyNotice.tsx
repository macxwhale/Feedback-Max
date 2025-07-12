
import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BrandedHeader } from './BrandedHeader';
import { BrandedButton } from './BrandedButton';
import { useDynamicBranding } from '@/hooks/useDynamicBranding';

interface PrivacyNoticeProps {
  isVisible: boolean;
  onAccept: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  isVisible,
  onAccept
}) => {
  const { colors, organizationName } = useDynamicBranding();

  if (!isVisible) return null;

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${colors.primary}dd 0%, ${colors.secondary}dd 50%, ${colors.accent}dd 100%)`
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
      <Card className="max-w-2xl w-full shadow-2xl border-0 overflow-hidden">
        <BrandedHeader
          title={`${organizationName} Feedback`}
          subtitle="Your feedback drives our commitment to excellence. Share your experience to help us serve you better."
          showSecureIndicator={true}
        />
        
        <CardContent className="p-8">
          <div className="border rounded-lg p-6" style={{ 
            backgroundColor: `${colors.primary}08`,
            borderColor: `${colors.primary}30`
          }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5" style={{ color: colors.primary }} />
              <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>
                Your Privacy Matters
              </h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm" style={{ color: colors.textSecondary }}>
                <Lock className="h-4 w-4" style={{ color: colors.secondary }} />
                <span>Encrypted & Secure</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: colors.textSecondary }}>
                <Eye className="h-4 w-4" style={{ color: colors.secondary }} />
                <span>Anonymous & Confidential</span>
              </div>
            </div>
            
            <div className="text-center">
              <BrandedButton
                onClick={onAccept}
                size="lg"
                className="px-12 py-3 text-lg"
              >
                I understand
              </BrandedButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
