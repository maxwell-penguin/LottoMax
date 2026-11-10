import { useCallback, useEffect, useRef, useState } from 'react';

export type Theme = 'light' | 'dark' | 'purple';
export type ThemeTransition =
  | 'to-dark'
  | 'to-purple'
  | 'to-light'
  | 'fade-light'
  | 'fade-dark'
  | 'fade-purple'
  | null;

const THEMES: Theme[] = ['light', 'dark', 'purple'];
// light -> dark -> purple -> light
const NEXT: Record<Theme, Theme> = { light: 'dark', dark: 'purple', purple: 'light' };
const META_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#1C1B19', purple: '#07030F' };

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored && THEMES.includes(stored)) return stored;
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
    if (meta) meta.setAttribute('content', META_COLOR[theme]);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (locking.current) return;

    const next = NEXT[theme];
    locking.current = true;

    let kind: ThemeTransition;
    let applyAt: number;
    let doneAt: number;

    if (prefersReducedMotion()) {
      kind = `fade-${next}`;
      applyAt = 150;
      doneAt = 330;
    } else if (next === 'light') {
      // Koi swim/wiggle in → circle twice → yin-yang → light wash.
      kind = 'to-light';
      applyAt = 3400;
      doneAt = 4400;
    } else if (next === 'purple') {
      // Red grows → blue grows → fuse purple → screen explode.
      kind = 'to-purple';
      applyAt = 1550;
      doneAt = 2400;
    } else {
      // light -> dark: existing meteor + iris sequence.
      kind = 'to-dark';
      applyAt = 900;
      doneAt = 2200;
    }

    setTransition(kind);
    window.setTimeout(() => setTheme(next), applyAt);
    window.setTimeout(() => {
      setTransition(null);
      locking.current = false;
    }, doneAt);
  }, [theme]);

  return { theme, toggleTheme, transition };
}
