
// Comprehensive Design System - Color Palette
// Inspired by Material Design with warm brand personality

export const designSystemColors = {
  // Primary Brand Colors (Warm Orange-Red)
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main primary
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // Secondary Colors (Professional Blue-Gray)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Accent Colors (Warm Amber)
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Success Colors (Natural Green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Error Colors (Warm Red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Warning Colors (Sunny Yellow)
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308', // Main warning
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // Neutral Colors (Warm Gray Scale)
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },

  // Surface Colors for Material Design elevation
  surface: {
    background: '#ffffff',
    paper: '#ffffff',
    elevated: '#f8fafc',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Text Colors with proper contrast
  text: {
    primary: '#1c1917',
    secondary: '#57534e',
    tertiary: '#78716c',
    disabled: '#a8a29e',
    inverse: '#ffffff',
  },

  // Interactive States
  states: {
    hover: {
      primary: '#ea580c',
      secondary: '#475569',
      accent: '#d97706',
      surface: '#f1f5f9',
    },
    active: {
      primary: '#c2410c',
      secondary: '#334155',
      accent: '#b45309',
      surface: '#e2e8f0',
    },
    focus: {
      ring: '#f97316',
      offset: '#ffffff',
    },
    disabled: {
      background: '#f5f5f4',
      text: '#a8a29e',
      border: '#e7e5e4',
    },
  },
};

// Semantic Color Mappings
export const semanticColors = {
  // Brand Identity
  brand: {
    primary: designSystemColors.primary[500],
    secondary: designSystemColors.secondary[500],
    accent: designSystemColors.accent[500],
  },

  // Functional Colors
  functional: {
    success: designSystemColors.success[500],
    error: designSystemColors.error[500],
    warning: designSystemColors.warning[500],
    info: designSystemColors.primary[500],
  },

  // UI Elements
  ui: {
    background: designSystemColors.surface.background,
    surface: designSystemColors.surface.paper,
    border: designSystemColors.neutral[200],
    divider: designSystemColors.neutral[100],
  },

  // Data Visualization (for charts and analytics)
  data: {
    primary: designSystemColors.primary[500],
    secondary: designSystemColors.accent[500],
    tertiary: designSystemColors.secondary[400],
    quaternary: designSystemColors.success[500],
    positive: designSystemColors.success[500],
    negative: designSystemColors.error[500],
    neutral: designSystemColors.neutral[400],
  },
};

// Export utility functions for color manipulation
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },

  // Get hover state color
  getHoverState: (colorKey: keyof typeof designSystemColors.states.hover) => {
    return designSystemColors.states.hover[colorKey];
  },

  // Get active state color
  getActiveState: (colorKey: keyof typeof designSystemColors.states.active) => {
    return designSystemColors.states.active[colorKey];
  },
};
