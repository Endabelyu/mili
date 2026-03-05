/**
 * Design Tokens - Personal Finance Tracker
 * Semantic color system, spacing scale, typography, and shadows
 */

// ============================================================================
// COLOR PALETTE - Semantic
// ============================================================================

export const colors = {
  // Primary - Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Income - Green (semantic)
  income: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Expense - Red (semantic)
  expense: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral - Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Category colors - For badges/icons
  category: {
    food: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },      // amber
    transport: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // blue
    entertainment: { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' }, // purple
    shopping: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },  // pink
    bills: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },     // red
    health: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },    // emerald
    education: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' }, // indigo
    salary: { bg: '#dcfce7', text: '#166534', border: '#86efac' },    // green
    freelance: { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' }, // teal
    investment: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' }, // yellow
    default: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },   // gray
  },
} as const;

// ============================================================================
// SPACING SCALE - 4px base unit
// ============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'].join(', '),
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'].join(', '),
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// SHADOWS / ELEVATION
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// FOCUS RING - Accessible focus states
// ============================================================================

export const focusRing = {
  DEFAULT: 'ring-2 ring-offset-2 ring-blue-500 focus:outline-none',
  primary: 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none',
  income: 'focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:outline-none',
  expense: 'focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none',
  danger: 'focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none',
} as const;

// ============================================================================
// BREAKPOINTS (for reference in JS)
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// UTILITY CLASSES HELPERS
// ============================================================================

export const utilityClasses = {
  // Transaction amount styling
  incomeAmount: 'text-green-700 font-semibold',
  expenseAmount: 'text-red-700 font-semibold',

  // Transaction row backgrounds
  incomeRow: 'bg-green-50/50 hover:bg-green-50',
  expenseRow: 'bg-red-50/50 hover:bg-red-50',

  // Category badge base
  categoryBadge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',

  // Card/container
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',

  // Form elements
  input: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
  inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',

  // Button variants
  btnPrimary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  btnIncome: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  btnExpense: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  btnOutline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  btnGhost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',

  // Empty state
  emptyState: 'text-center py-12 text-gray-500',

  // Loading skeleton
  skeleton: 'animate-pulse bg-gray-200 rounded',
} as const;
