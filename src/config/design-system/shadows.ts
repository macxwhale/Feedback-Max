
// Shadow System - Material Design Elevation
export const shadows = {
  // Material Design Elevation Levels
  none: 'none',
  
  // Level 1: Cards at rest
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  
  // Level 2: Raised buttons, cards on hover
  md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  
  // Level 3: FABs, raised cards
  lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  
  // Level 4: Dropdowns, tooltips
  xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  
  // Level 5: Modals, drawers
  '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // Level 6: Bottom sheets
  '3xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Inner shadows for inputs
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // Colored shadows for focus states
  focus: {
    primary: '0 0 0 3px rgb(249 115 22 / 0.1)',
    secondary: '0 0 0 3px rgb(100 116 139 / 0.1)',
    accent: '0 0 0 3px rgb(245 158 11 / 0.1)',
    error: '0 0 0 3px rgb(239 68 68 / 0.1)',
    success: '0 0 0 3px rgb(34 197 94 / 0.1)',
  },

  // Component-specific shadows
  component: {
    button: {
      default: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      hover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      active: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },
    card: {
      default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      hover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    tooltip: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
};
