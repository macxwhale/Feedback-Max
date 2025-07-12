
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDynamicBranding } from '@/hooks/useDynamicBranding';
import { cn } from '@/lib/utils';

interface BrandedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
}

export const BrandedButton: React.FC<BrandedButtonProps> = ({
  children,
  onClick,
  size = 'lg',
  variant = 'primary',
  className,
  disabled = false
}) => {
  const { colors } = useDynamicBranding();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
          '&:hover': {
            background: `linear-gradient(to right, ${colors.primary}dd, ${colors.accent}dd)`
          }
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          '&:hover': {
            backgroundColor: `${colors.secondary}dd`
          }
        };
      case 'outline':
        return {
          borderColor: colors.primary,
          color: colors.primary,
          '&:hover': {
            backgroundColor: colors.primary,
            color: 'white'
          }
        };
      default:
        return {};
    }
  };

  const buttonStyle = getButtonStyle();

  return (
    <Button
      onClick={onClick}
      size={size}
      disabled={disabled}
      className={cn(
        "text-white font-semibold transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl",
        variant === 'primary' && "text-white",
        variant === 'outline' && "bg-transparent border-2",
        className
      )}
      style={buttonStyle}
    >
      {children}
    </Button>
  );
};
