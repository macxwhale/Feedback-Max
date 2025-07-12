
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { 
  responsiveSpacing, 
  layoutDensity, 
  touchTargets,
  type LayoutDensity,
  type TouchTarget 
} from '@/config/design-system/responsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  
  // Layout density options
  density?: LayoutDensity | 'auto';
  
  // Container behavior
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: 'none' | 'auto';
  centerContent?: boolean;
  
  // Touch optimization
  touchOptimized?: boolean;
  
  // Accessibility
  skipLink?: string;
  ariaLabel?: string;
  role?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  density = 'auto',
  maxWidth = 'full',
  padding = 'auto',
  centerContent = true,
  touchOptimized = false,
  skipLink,
  ariaLabel,
  role = 'main'
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

  // Determine layout density
  const effectiveDensity = React.useMemo(() => {
    if (density !== 'auto') return density;
    
    if (shouldUseCompactLayout || isMobile) return 'compact';
    if (currentBreakpoint === 'xl') return 'spacious';
    return 'comfortable';
  }, [density, shouldUseCompactLayout, currentBreakpoint, isMobile]);

  // Get responsive padding with better mobile optimization
  const containerPadding = React.useMemo(() => {
    if (padding === 'none') return '';
    
    const paddingValues = {
      xs: '1rem',      // 16px on mobile
      sm: '1.25rem',   // 20px on small tablets  
      md: '1.5rem',    // 24px on tablets
      lg: '2rem',      // 32px on desktop
      xl: '2.5rem',    // 40px on large screens
    };
    
    return getResponsiveValue(paddingValues);
  }, [padding, getResponsiveValue]);

  // Get max width classes
  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full max-w-full'
  };

  // Touch target styles
  const touchStyles = shouldUseTouch || touchOptimized ? {
    minHeight: isMobile ? touchTargets.comfortable.height : touchTargets.minimum.height,
    minWidth: isMobile ? touchTargets.comfortable.width : touchTargets.minimum.width,
  } : {};

  return (
    <div
      className={cn(
        'w-full transition-all',
        !prefersReducedMotion && 'duration-300 ease-out',
        
        // Max width with proper mobile handling
        maxWidthClasses[maxWidth],
        
        // Centering with mobile considerations
        centerContent && maxWidth !== 'full' && !isMobile && 'mx-auto',
        
        // Density-based spacing with mobile optimization
        effectiveDensity === 'compact' && 'space-y-2 sm:space-y-3',
        effectiveDensity === 'comfortable' && 'space-y-3 sm:space-y-4 md:space-y-5',
        effectiveDensity === 'spacious' && 'space-y-4 sm:space-y-5 md:space-y-6',
        
        // Mobile-specific classes
        isMobile && 'min-h-0 overflow-x-hidden',
        
        className
      )}
      style={{
        padding: containerPadding,
        ...touchStyles,
      }}
      role={role}
      aria-label={ariaLabel}
    >
      {/* Skip link for accessibility */}
      {skipLink && (
        <a
          href={skipLink}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
      )}
      
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  
  // Grid configuration with improved mobile defaults
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  // Gap configuration
  gap?: 'sm' | 'md' | 'lg' | 'auto';
  
  // Alignment
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  columns = { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }, // Better mobile-first defaults
  gap = 'auto',
  alignItems = 'stretch',
  justifyContent = 'start'
}) => {
  const { 
    currentBreakpoint, 
    getResponsiveValue,
    shouldUseCompactLayout,
    prefersReducedMotion,
    isMobile,
    isTablet
  } = useResponsiveDesign();

  // Get current column count
  const currentColumns = getResponsiveValue(columns);
  
  // Get responsive gap with mobile optimization
  const gridGap = React.useMemo(() => {
    if (gap !== 'auto') return gap;
    if (isMobile) return 'sm';
    if (isTablet) return 'md';
    return 'lg';
  }, [gap, isMobile, isTablet]);

  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-5 md:gap-6', 
    lg: 'gap-5 sm:gap-6 md:gap-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div
      className={cn(
        'grid transition-all w-full',
        !prefersReducedMotion && 'duration-300 ease-out',
        gapClasses[gridGap],
        alignClasses[alignItems],
        justifyClasses[justifyContent],
        
        // Mobile-specific optimizations
        isMobile && 'min-w-0 overflow-hidden',
        
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${currentColumns}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  
  // Stack direction
  direction?: 'vertical' | 'horizontal' | 'auto';
  
  // Spacing
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'auto';
  
  // Alignment
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  // Responsive behavior
  stackAt?: 'xs' | 'sm' | 'md' | 'lg' | 'never';
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = 'auto',
  spacing = 'auto',
  align = 'stretch',
  justify = 'start',
  stackAt = 'sm'
}) => {
  const { 
    currentBreakpoint, 
    shouldUseCompactLayout,
    isBreakpointDown,
    prefersReducedMotion,
    isMobile,
    isTablet
  } = useResponsiveDesign();

  // Determine if should stack with better mobile handling
  const shouldStack = React.useMemo(() => {
    if (direction === 'vertical') return true;
    if (direction === 'horizontal') return false;
    if (stackAt === 'never') return false;
    
    return isBreakpointDown(stackAt);
  }, [direction, stackAt, isBreakpointDown]);

  // Get spacing value with mobile optimization
  const stackSpacing = React.useMemo(() => {
    if (spacing === 'none') return 'none';
    if (spacing !== 'auto') return spacing;
    if (isMobile) return 'sm';
    if (isTablet) return 'md';
    return 'lg';
  }, [spacing, isMobile, isTablet]);

  const spacingClasses = {
    none: '',
    sm: shouldStack ? 'space-y-2 sm:space-y-3' : 'space-x-2 sm:space-x-3',
    md: shouldStack ? 'space-y-3 sm:space-y-4 md:space-y-5' : 'space-x-3 sm:space-x-4 md:space-x-5',
    lg: shouldStack ? 'space-y-4 sm:space-y-5 md:space-y-6' : 'space-x-4 sm:space-x-5 md:space-x-6',
  };

  const alignClasses = {
    start: shouldStack ? 'items-start' : 'items-start',
    center: shouldStack ? 'items-center' : 'items-center', 
    end: shouldStack ? 'items-end' : 'items-end',
    stretch: shouldStack ? 'items-stretch' : 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div
      className={cn(
        'flex transition-all w-full',
        !prefersReducedMotion && 'duration-300 ease-out',
        shouldStack ? 'flex-col' : 'flex-row flex-wrap',
        spacingClasses[stackSpacing],
        alignClasses[align],
        justifyClasses[justify],
        
        // Mobile optimizations
        isMobile && 'min-w-0',
        
        className
      )}
    >
      {children}
    </div>
  );
};
