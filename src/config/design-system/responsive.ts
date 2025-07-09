// Enhanced Responsive Design System
// Following Material Design's responsive layout guidance and Apple's HIG

export const breakpoints = {
  // Mobile-first approach with semantic naming
  xs: '0px',      // 0-479px: Compact phones
  sm: '480px',    // 480-767px: Standard phones  
  md: '768px',    // 768-1023px: Tablets
  lg: '1024px',   // 1024-1439px: Desktop
  xl: '1440px',   // 1440px+: Large screens
} as const;

// Responsive spacing system based on screen density
export const responsiveSpacing = {
  // Container padding adapts to screen size
  container: {
    xs: '1rem',    // 16px - Compact for small screens
    sm: '1.5rem',  // 24px - Standard mobile
    md: '2rem',    // 32px - Tablet comfortable
    lg: '2.5rem',  // 40px - Desktop spacious
    xl: '3rem',    // 48px - Large screen luxury
  },
  
  // Component spacing varies by context
  component: {
    xs: '0.75rem', // 12px - Tight mobile spacing
    sm: '1rem',    // 16px - Standard mobile
    md: '1.25rem', // 20px - Tablet breathing room
    lg: '1.5rem',  // 24px - Desktop comfortable
    xl: '2rem',    // 32px - Large screen generous
  },
  
  // Section gaps for layout rhythm
  section: {
    xs: '1.5rem',  // 24px - Compact sections
    sm: '2rem',    // 32px - Mobile sections
    md: '3rem',    // 48px - Tablet sections
    lg: '4rem',    // 64px - Desktop sections
    xl: '5rem',    // 80px - Large screen sections
  }
} as const;

// Layout density modes for different contexts
export const layoutDensity = {
  compact: {
    padding: '0.5rem',
    gap: '0.5rem',
    height: '2rem',
    fontSize: '0.875rem',
  },
  comfortable: {
    padding: '1rem',
    gap: '1rem', 
    height: '2.5rem',
    fontSize: '1rem',
  },
  spacious: {
    padding: '1.5rem',
    gap: '1.5rem',
    height: '3rem',
    fontSize: '1.125rem',
  }
} as const;

// Touch target guidelines (Material Design + Apple HIG)
export const touchTargets = {
  // Minimum touch target sizes
  minimum: {
    width: '44px',
    height: '44px',
  },
  
  // Recommended touch target sizes
  comfortable: {
    width: '48px',
    height: '48px',
  },
  
  // Generous touch targets for accessibility
  accessible: {
    width: '56px', 
    height: '56px',
  }
} as const;

// Responsive typography scale
export const responsiveTypography = {
  // Headings scale with screen size
  headings: {
    h1: {
      xs: '1.5rem',   // 24px - Mobile headline
      sm: '1.75rem',  // 28px - Phone headline
      md: '2rem',     // 32px - Tablet headline
      lg: '2.25rem',  // 36px - Desktop headline
      xl: '2.5rem',   // 40px - Large screen headline
    },
    h2: {
      xs: '1.25rem',  // 20px
      sm: '1.375rem', // 22px
      md: '1.5rem',   // 24px
      lg: '1.75rem',  // 28px
      xl: '2rem',     // 32px
    },
    h3: {
      xs: '1.125rem', // 18px
      sm: '1.25rem',  // 20px
      md: '1.375rem', // 22px
      lg: '1.5rem',   // 24px
      xl: '1.75rem',  // 28px
    }
  },
  
  // Body text optimized for readability
  body: {
    large: {
      xs: '1rem',     // 16px - Standard mobile
      sm: '1rem',     // 16px - Phone readable
      md: '1.125rem', // 18px - Tablet comfortable
      lg: '1.125rem', // 18px - Desktop readable
      xl: '1.25rem',  // 20px - Large screen luxury
    },
    medium: {
      xs: '0.875rem', // 14px - Compact mobile
      sm: '0.875rem', // 14px - Phone standard
      md: '1rem',     // 16px - Tablet standard
      lg: '1rem',     // 16px - Desktop standard
      xl: '1.125rem', // 18px - Large comfortable
    }
  }
} as const;

// Animation durations based on Material Design motion
export const responsiveAnimations = {
  // Faster on mobile for perceived performance
  duration: {
    xs: '150ms',  // Quick mobile interactions
    sm: '200ms',  // Standard mobile
    md: '250ms',  // Tablet smooth
    lg: '300ms',  // Desktop elegant
    xl: '350ms',  // Large screen luxurious
  },
  
  // Easing curves for natural motion
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  }
} as const;

// Accessibility preferences
export const accessibilityFeatures = {
  // Reduced motion support
  reducedMotion: {
    duration: '0ms',
    transform: 'none',
  },
  
  // High contrast support
  highContrast: {
    borderWidth: '2px',
    outlineWidth: '3px',
  },
  
  // Focus indicators
  focus: {
    ringWidth: '2px',
    ringOffset: '2px',
    ringOpacity: '0.5',
  }
} as const;

// Utility functions for responsive design
export const responsiveUtils = {
  // Get value for current breakpoint
  getResponsiveValue: <T>(values: Record<string, T>, currentBreakpoint: string): T => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    // Find the largest applicable value
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    // Fallback to smallest available value
    return Object.values(values)[0];
  },
  
  // Generate responsive classes
  generateResponsiveClasses: (property: string, values: Record<string, string>) => {
    return Object.entries(values).map(([breakpoint, value]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}${property}-[${value}]`;
    }).join(' ');
  },
  
  // Check if device supports hover
  supportsHover: () => {
    return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  },
  
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return typeof window !== 'undefined' && 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Check if user prefers high contrast
  prefersHighContrast: () => {
    return typeof window !== 'undefined' && 
           window.matchMedia('(prefers-contrast: high)').matches;
  }
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type ResponsiveSpacing = typeof responsiveSpacing;
export type LayoutDensity = keyof typeof layoutDensity;
export type TouchTarget = keyof typeof touchTargets;