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

const DARK_REVEAL_AT_MS = 520; // shockwave start; keep in sync with --td-wave-delay in Home.css
const DARK_REVEAL_MS = 400; // shockwave duration; keep in sync with --td-wave-ms

// Impact point lives in CSS (--impact-x / --impact-y, in vw/vh); read it back in px here.
function impactPoint() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;left:var(--impact-x);top:var(--impact-y)';
  document.body.appendChild(probe);
  const r = probe.getBoundingClientRect();
  probe.remove();
  return { x: r.left, y: r.top };
}

/**
 * Flip the theme so the dark page is uncovered by an expanding circle from the impact
 * point (View Transitions API). Browsers without it just flip instantly under the flash.
 */
function revealDark(apply: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => Promise<void> | void) => { ready: Promise<void> };
  };
  const flip = () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    apply();
  };
  if (!doc.startViewTransition) {
    flip();
    return;
  }
  const { x, y } = impactPoint();
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
  const vt = doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        flip();
        // let React commit the new theme state before the "after" snapshot is taken
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
      {
        duration: DARK_REVEAL_MS,
        easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
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
      // Koi swim/wiggle in → circle twice → light wash.
      kind = 'to-light';
      applyAt = 3400;
      doneAt = 4400;
    } else if (next === 'purple') {
      // Red grows → blue grows → fuse purple → screen explode.
      kind = 'to-purple';
      applyAt = 1550;
      doneAt = 2400;
    } else {
      // light -> dark: meteor falls (0-450ms), flash, shockwave (520-920ms) uncovers dark.
      kind = 'to-dark';
      applyAt = DARK_REVEAL_AT_MS;
      doneAt = 1100;
    }

    setTransition(kind);
    window.setTimeout(() => {
      if (kind === 'to-dark') revealDark(() => setTheme(next));
      else setTheme(next);
    }, applyAt);
    window.setTimeout(() => {
      setTransition(null);
      locking.current = false;
    }, doneAt);
  }, [theme]);

  return { theme, toggleTheme, transition };
}
