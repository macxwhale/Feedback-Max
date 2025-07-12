
import { designSystemColors, semanticColors } from '../design-system/colors';
import { typography } from '../design-system/typography';
import { spacing } from '../design-system/spacing';
import { shadows } from '../design-system/shadows';
import { borderRadius } from '../design-system/borderRadius';
import { keyframes, animation } from './animations';

export const themeConfig = {
  container: {
    center: true,
    padding: '2rem',
    screens: {
      '2xl': '1400px'
    }
  },
  extend: {
    // Typography
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,

    // Colors - Enhanced with our design system
    colors: {
      // Design System Colors
      ...designSystemColors,
      
      // Semantic mappings
      brand: semanticColors.brand,
      functional: semanticColors.functional,
      ui: semanticColors.ui,
      data: semanticColors.data,

      // Legacy warm colors (maintained for backward compatibility)
      'sunset': designSystemColors.primary,
      'golden': designSystemColors.accent,
      'coral': {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#F67280', // Primary warm coral
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
      },
      'warm-gray': designSystemColors.neutral,
      'dark-warm': designSystemColors.secondary,

      // Shadcn UI colors (using our design system)
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))'
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))'
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))'
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))'
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))'
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))'
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))'
      },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        primary: 'hsl(var(--sidebar-primary))',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        border: 'hsl(var(--sidebar-border))',
        ring: 'hsl(var(--sidebar-ring))'
      }
    },

    // Spacing
    spacing,

    // Shadows
    boxShadow: shadows,

    // Border Radius
    borderRadius: {
      ...borderRadius,
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)'
    },

    // Background Images (maintained)
    backgroundImage: {
      'gradient-warm': `linear-gradient(135deg, ${designSystemColors.primary[500]}, ${designSystemColors.accent[400]}, ${designSystemColors.accent[500]})`,
      'gradient-dark-warm': `linear-gradient(135deg, ${designSystemColors.primary[600]}, ${designSystemColors.accent[500]}, ${designSystemColors.accent[600]})`,
      'fluid-1': `radial-gradient(ellipse at top, ${designSystemColors.primary[500]}, transparent)`,
      'fluid-2': `radial-gradient(ellipse at bottom right, ${designSystemColors.accent[400]}, transparent)`,
      'fluid-3': `radial-gradient(ellipse at center left, ${designSystemColors.accent[500]}, transparent)`,
    },

    // Animations
    keyframes,
    animation
  }
};
