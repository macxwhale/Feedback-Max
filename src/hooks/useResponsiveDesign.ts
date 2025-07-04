
import { useState, useEffect } from 'react';

export type BreakpointType = 'mobile' | 'tablet' | 'desktop';
export type OrientationType = 'portrait' | 'landscape';

interface ResponsiveState {
  breakpoint: BreakpointType;
  orientation: OrientationType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  hasHover: boolean;
  isTouchDevice: boolean;
}

export const useResponsiveDesign = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => ({
    breakpoint: 'desktop',
    orientation: 'landscape',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
    hasHover: true,
    isTouchDevice: false,
  }));

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: BreakpointType = 'desktop';
      if (width < 768) breakpoint = 'mobile';
      else if (width < 1024) breakpoint = 'tablet';

      const orientation: OrientationType = width > height ? 'landscape' : 'portrait';
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setState({
        breakpoint,
        orientation,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        screenWidth: width,
        screenHeight: height,
        hasHover,
        isTouchDevice,
      });
    };

    updateState();
    
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const resizeHandler = () => updateState();
    
    window.addEventListener('resize', resizeHandler);
    mediaQuery.addEventListener('change', updateState);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      mediaQuery.removeEventListener('change', updateState);
    };
  }, []);

  return state;
};
