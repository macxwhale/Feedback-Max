
import { useState, useEffect, useMemo } from 'react';
import { breakpoints, responsiveUtils, type Breakpoint } from '@/config/design-system/responsive';

interface UseResponsiveDesignReturn {
  // Current state
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  
  // Enhanced breakpoint system
  breakpoint: 'mobile' | 'tablet' | 'desktop'; // Legacy compatibility
  currentBreakpoint: Breakpoint;
  isBreakpoint: (bp: Breakpoint) => boolean;
  isBreakpointUp: (bp: Breakpoint) => boolean;
  isBreakpointDown: (bp: Breakpoint) => boolean;
  
  // Device capabilities
  isTouchDevice: boolean;
  hasHover: boolean;
  supportsHover: boolean;
  
  // Accessibility preferences
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  
  // Layout helpers
  getResponsiveValue: <T>(values: Record<string, T>) => T;
  shouldUseCompactLayout: boolean;
  shouldUseTouch: boolean;
}

export const useResponsiveDesign = (): UseResponsiveDesignReturn => {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    const handlePreferencesChange = () => {
      setPreferences({
        prefersReducedMotion: responsiveUtils.prefersReducedMotion(),
        prefersHighContrast: responsiveUtils.prefersHighContrast(),
      });
    };

    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    // Set up media query listeners for preferences
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    reducedMotionQuery.addEventListener('change', handlePreferencesChange);
    highContrastQuery.addEventListener('change', handlePreferencesChange);
    
    // Set initial values
    handleResize();
    handlePreferencesChange();

    return () => {
      window.removeEventListener('resize', handleResize);
      reducedMotionQuery.removeEventListener('change', handlePreferencesChange);
      highContrastQuery.removeEventListener('change', handlePreferencesChange);
    };
  }, []);

  // Memoized calculations for performance
  const breakpointInfo = useMemo(() => {
    const getCurrentBreakpoint = (): Breakpoint => {
      if (screenWidth < 480) return 'xs';
      if (screenWidth < 768) return 'sm';
      if (screenWidth < 1024) return 'md';
      if (screenWidth < 1440) return 'lg';
      return 'xl';
    };

    const currentBreakpoint = getCurrentBreakpoint();
    
    return {
      currentBreakpoint,
      isMobile: screenWidth < 768,
      isTablet: screenWidth >= 768 && screenWidth < 1024,
      isDesktop: screenWidth >= 1024,
      isBreakpoint: (bp: Breakpoint) => currentBreakpoint === bp,
      isBreakpointUp: (bp: Breakpoint) => {
        const bpValues = { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1440 };
        return screenWidth >= bpValues[bp];
      },
      isBreakpointDown: (bp: Breakpoint) => {
        const bpValues = { xs: 479, sm: 767, md: 1023, lg: 1439, xl: Infinity };
        return screenWidth <= bpValues[bp];
      },
    };
  }, [screenWidth]);

  // Device capability detection
  const deviceCapabilities = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        isTouchDevice: false,
        hasHover: false,
        supportsHover: false,
      };
    }

    const isTouchDevice = (
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0
    );

    const hasHover = responsiveUtils.supportsHover();

    return {
      isTouchDevice,
      hasHover,
      supportsHover: hasHover,
    };
  }, []);

  // Layout helpers
  const layoutHelpers = useMemo(() => {
    const shouldUseCompactLayout = breakpointInfo.isMobile || 
      (breakpointInfo.isTablet && deviceCapabilities.isTouchDevice);
    
    const shouldUseTouch = deviceCapabilities.isTouchDevice || breakpointInfo.isMobile;

    const getResponsiveValue = <T>(values: Record<string, T>): T => {
      return responsiveUtils.getResponsiveValue(values, breakpointInfo.currentBreakpoint);
    };

    return {
      shouldUseCompactLayout,
      shouldUseTouch,
      getResponsiveValue,
    };
  }, [breakpointInfo, deviceCapabilities]);

  return {
    // Current state
    screenWidth,
    ...breakpointInfo,
    
    // Legacy compatibility
    breakpoint: breakpointInfo.isMobile ? 'mobile' : 
               breakpointInfo.isTablet ? 'tablet' : 'desktop',
    
    // Device capabilities
    ...deviceCapabilities,
    
    // Accessibility preferences
    ...preferences,
    
    // Layout helpers
    ...layoutHelpers,
  };
};
