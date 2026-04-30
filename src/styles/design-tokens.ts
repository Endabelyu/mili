/**
 * Design Tokens - Personal Finance Tracker
 * Semantic color system, spacing scale, typography, and shadows for FlowState Theme
 */

// ============================================================================
// COLOR PALETTE - Semantic
// ============================================================================

export const colors = {
  // Primary - FlowState Lime Green
  primary: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
  },

  // Income - Semantic Green
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

  // Expense - Semantic Dark/Red
  expense: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Neutral - Gray scale
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Category colors - Pastel backgrounds with strong text
  category: {
    food: { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },      // orange/amber 
    transport: { bg: '#ffe4e6', text: '#e11d48', border: '#fda4af' }, // rose
    entertainment: { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' }, // purple
    shopping: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },  // blue
    bills: { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' },     // pink
    health: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },    // green
    education: { bg: '#e0e7ff', text: '#4338ca', border: '#a5b4fc' }, // indigo
    salary: { bg: '#ecfccb', text: '#4d7c0f', border: '#bef264' },    // lime
    freelance: { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' }, // teal
    investment: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' }, // amber
    family: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },    // blue
    debt: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },      // slate
    charity: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },   // red/rose
    housing: { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' },   // orange
    default: { bg: '#f4f4f5', text: '#52525b', border: '#e4e4e7' },   // zinc
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
    extrabold: '800',
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
  card: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
  none: 'none',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  card: '20px',
  full: '9999px',
} as const;
