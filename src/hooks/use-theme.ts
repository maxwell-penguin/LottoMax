import { useCallback, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';
export type ThemeTransition = 'to-light' | 'to-dark' | null;

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [transition, setTransition] = useState<ThemeTransition>(null);
  const locking = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1C1B19' : '#ffffff');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (locking.current) return;

    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    if (prefersReducedMotion()) {
      setTheme(next);
      return;
    }

    locking.current = true;
    const kind = next === 'light' ? 'to-light' : 'to-dark';
    setTransition(kind);

    // Dark: flood black first, then flip theme under the veil.
    // Light: sun blooms, flip mid-bloom so dawn reveals the light UI.
    const applyAt = next === 'dark' ? 320 : 220;
    const doneAt = next === 'dark' ? 1200 : 1050;

    window.setTimeout(() => setTheme(next), applyAt);
    window.setTimeout(() => {
      setTransition(null);
      locking.current = false;
    }, doneAt);
  }, [theme]);

  return { theme, toggleTheme, transition };
}
