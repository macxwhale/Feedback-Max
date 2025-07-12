
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';

interface EnhancedButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  hapticFeedback?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  className,
  touchOptimized = false,
  icon,
  loading = false,
  hapticFeedback = false,
  onClick,
  disabled,
  ...props
}) => {
  const { isMobile, isTouchDevice } = useResponsiveDesign();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.(e);
  };

  const isOptimizedForTouch = touchOptimized || (isMobile && isTouchDevice);

  return (
    <Button
      className={cn(
        // Base styles
        'relative transition-all duration-200',
        // Touch optimization
        isOptimizedForTouch && [
          'min-h-[44px] min-w-[44px]', // 44px minimum touch target
          'px-6 py-3 text-base', // Larger padding and text
          'active:scale-95', // Tactile feedback
        ],
        // Loading state
        loading && 'pointer-events-none opacity-70',
        // Icon spacing
        icon && children && 'gap-2',
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
        {icon}
        {children}
      </div>
    </Button>
  );
};
