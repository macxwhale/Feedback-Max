
// Spacing System - Material Design 8px Grid
export const spacing = {
  // Base unit: 4px (0.25rem)
  px: '1px',
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px - Base grid
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px - 2x base
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px - 3x base
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px - 4x base
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px - 5x base
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px - 6x base
  14: '3.5rem',    // 56px - 7x base
  16: '4rem',      // 64px - 8x base
  20: '5rem',      // 80px - 10x base
  24: '6rem',      // 96px - 12x base
  28: '7rem',      // 112px - 14x base
  32: '8rem',      // 128px - 16x base
  36: '9rem',      // 144px - 18x base
  40: '10rem',     // 160px - 20x base
  44: '11rem',     // 176px - 22x base
  48: '12rem',     // 192px - 24x base
  52: '13rem',     // 208px - 26x base
  56: '14rem',     // 224px - 28x base
  60: '15rem',     // 240px - 30x base
  64: '16rem',     // 256px - 32x base
  72: '18rem',     // 288px - 36x base
  80: '20rem',     // 320px - 40x base
  96: '24rem',     // 384px - 48x base
};

// Component-specific spacing
export const componentSpacing = {
  // Buttons
  button: {
    paddingX: {
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
    },
    paddingY: {
      sm: spacing[1.5],
      md: spacing[2.5],
      lg: spacing[3],
    },
    gap: spacing[2],
  },

  // Cards
  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    gap: spacing[4],
  },

  // Forms
  form: {
    fieldGap: spacing[4],
    labelGap: spacing[1.5],
    groupGap: spacing[6],
  },

  // Navigation
  nav: {
    itemPadding: spacing[3],
    itemGap: spacing[1],
    sectionGap: spacing[6],
  },

  // Layout
  layout: {
    containerPadding: {
      mobile: spacing[4],
      tablet: spacing[6],
      desktop: spacing[8],
    },
    sectionGap: {
      sm: spacing[8],
      md: spacing[12],
      lg: spacing[16],
    },
  },
};
