import { useState, useEffect, useCallback } from 'react';

export const THEMES = [
  'fresh-mint',
  'candy-pop',
  'sunny-yellow',
  'midnight-blue',
  'warm-charcoal',
  'deep-purple',
  'system'
] as const;

export type Theme = typeof THEMES[number];

const STORAGE_KEY = 'finance-tracker-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && THEMES.includes(stored)) return stored;
  
  return 'system';
}

function getEffectiveTheme(theme: Theme): Exclude<Theme, 'system'> {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'fresh-mint';
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'midnight-blue' 
      : 'fresh-mint';
  }
  return theme as Exclude<Theme, 'system'>;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<Exclude<Theme, 'system'>>('fresh-mint');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getInitialTheme();
    setTheme(initial);
    setEffectiveTheme(getEffectiveTheme(initial));
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const effective = getEffectiveTheme(theme);
    setEffectiveTheme(effective);

    // Apply theme to document
    const root = document.documentElement;
    
    // Remove all existing theme classes and the standard 'dark' class
    root.classList.remove('dark');
    THEMES.forEach(t => {
      if (t !== 'system') root.classList.remove(`theme-${t}`);
    });
    
    // The design relies on .theme-* classes + .dark if it's a dark theme variant
    root.classList.add(`theme-${effective}`);
    
    if (['midnight-blue', 'warm-charcoal', 'deep-purple'].includes(effective)) {
      root.classList.add('dark');
    }

    // Store preference
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const newEffective = e.matches ? 'midnight-blue' : 'fresh-mint';
      setEffectiveTheme(newEffective);
      
      const root = document.documentElement;
      root.classList.remove('dark');
      THEMES.forEach(t => {
        if (t !== 'system') root.classList.remove(`theme-${t}`);
      });
      
      root.classList.add(`theme-${newEffective}`);
      if (['midnight-blue', 'warm-charcoal', 'deep-purple'].includes(newEffective)) {
        root.classList.add('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, mounted]);

  const setThemeValue = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return {
    theme,
    effectiveTheme,
    setTheme: setThemeValue,
    mounted,
  };
}
