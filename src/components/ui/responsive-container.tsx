
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { responsiveSpacing } from '@/config/design-system/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'auto';
  centerContent?: boolean;
  touchOptimized?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'full',
  padding = 'auto',
  centerContent = true,
  touchOptimized = false
}) => {
  const { 
    currentBreakpoint, 
    shouldUseCompactLayout, 
    shouldUseTouch,
    getResponsiveValue,
    prefersReducedMotion,
    isMobile,
    isTablet
  } = useResponsiveDesign();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full max-w-full'
  };

  // Get responsive padding based on current breakpoint with mobile optimization
  const containerPadding = React.useMemo(() => {
    if (padding === 'none') return '0';
    
    if (padding === 'auto') {
      const paddingValues = {
        xs: '1rem',      // 16px on mobile
        sm: '1.25rem',   // 20px on small tablets
        md: '1.5rem',    // 24px on tablets
        lg: '2rem',      // 32px on desktop
        xl: '2.5rem',    // 40px on large screens
      };
      return getResponsiveValue(paddingValues);
    }
    
    // Manual padding values optimized for dashboard content
    const paddingValues = {
      sm: { 
        xs: '0.75rem',   // 12px on mobile
        sm: '1rem',      // 16px on small tablets
        md: '1.25rem',   // 20px on tablets
        lg: '1.5rem',    // 24px on desktop
        xl: '1.75rem'    // 28px on large screens
      },
      md: { 
        xs: '1rem',      // 16px on mobile
        sm: '1.25rem',   // 20px on small tablets
        md: '1.5rem',    // 24px on tablets
        lg: '2rem',      // 32px on desktop
        xl: '2.25rem'    // 36px on large screens
      },
      lg: { 
        xs: '1.25rem',   // 20px on mobile
        sm: '1.5rem',    // 24px on small tablets
        md: '2rem',      // 32px on tablets
        lg: '2.5rem',    // 40px on desktop
        xl: '3rem'       // 48px on large screens
      }
    };
    
    return getResponsiveValue(paddingValues[padding]);
  }, [padding, getResponsiveValue]);

  // Touch optimization
  const effectiveTouchOptimized = touchOptimized || shouldUseTouch;

  return (
    <div
      className={cn(
        'w-full transition-all',
        !prefersReducedMotion && 'duration-300 ease-out',
        maxWidthClasses[maxWidth],
        centerContent && maxWidth !== 'full' && !isMobile && 'mx-auto',
        
        // Touch optimizations
        effectiveTouchOptimized && [
          'touch-pan-y touch-pan-x',
          shouldUseCompactLayout && 'space-y-3',
        ],
        
        // Improved spacing for dashboard content with mobile optimization
        isMobile && 'space-y-3',
        isTablet && 'space-y-4',
        !isMobile && !isTablet && 'space-y-6',
        
        // Ensure content fits properly with mobile handling
        'min-h-0 overflow-x-hidden',
        
        className
      )}
      style={{
        padding: containerPadding
      }}
    >
      {children}
    </div>
  );
};
