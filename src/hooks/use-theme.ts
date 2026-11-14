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

// Meteor-impact timing (ms, from the moment the animation actually starts on screen)
export const METEOR = { FALL_MS: 450, FLASH_MS: 110, WAVE_AT_MS: 520, WAVE_MS: 400, TOTAL_MS: 1100 };
export const WAVE_EASING = [0.2, 0.7, 0.3, 1] as const;

// Impact point lives in CSS (--impact-x / --impact-y, in vw/vh); read it back in px here.
export function impactPoint() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;left:var(--impact-x);top:var(--impact-y)';
  document.body.appendChild(probe);
  const r = probe.getBoundingClientRect();
  probe.remove();
  return { x: r.left, y: r.top };
}

type VT = { ready: Promise<void>; finished: Promise<void> };
type StartVT = (cb: () => Promise<void> | void) => VT;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [transition, setTransition] = useState<ThemeTransition>(null);
  // performance.now() timestamp at which the meteor animation actually starts (null = not yet)
  const [transitionGo, setTransitionGo] = useState<number | null>(null);
  const locking = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META_COLOR[theme]);
  }, [theme]);

  /**
   * light -> dark. The dark page is captured up front (View Transitions) while nothing is
   * animating, then the meteor/shockwave clock starts only once the snapshots are ready, so
   * the heavy work never lands mid-animation. Without the API, the theme flips under the flash.
   */
  const runMeteor = (apply: () => void) => {
    const finish = () => {
      setTransition(null);
      setTransitionGo(null);
      locking.current = false;
    };
    const flip = () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      apply();
    };
    const startVT = (document as Document & { startViewTransition?: StartVT }).startViewTransition;
    if (!startVT) {
      setTransition('to-dark');
      setTransitionGo(performance.now());
      window.setTimeout(flip, METEOR.WAVE_AT_MS);
      window.setTimeout(finish, METEOR.TOTAL_MS);
      return;
    }
    const { x, y } = impactPoint();
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
    const vt = startVT.call(
      document,
      () =>
        new Promise<void>((resolve) => {
          flip();
          setTransition('to-dark'); // overlay (canvas) is part of the "after" state, waiting for `go`
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
    vt.ready.then(() => {
      setTransitionGo(performance.now());
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
        {
          duration: METEOR.WAVE_MS,
          delay: METEOR.WAVE_AT_MS,
          fill: 'both',
          easing: `cubic-bezier(${WAVE_EASING.join(',')})`,
          pseudoElement: '::view-transition-new(root)',
        },
      );
      window.setTimeout(finish, METEOR.TOTAL_MS);
    });
    vt.ready.catch(finish);
  };

  const toggleTheme = useCallback(() => {
    if (locking.current) return;

    const next = NEXT[theme];
    locking.current = true;

    if (!prefersReducedMotion() && next === 'dark') {
      runMeteor(() => setTheme('dark'));
      return;
    }

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
      kind = 'fade-' + next; // unreachable (next is dark/light/purple handled above)
      applyAt = 150;
      doneAt = 330;
    }

    setTransition(kind);
    window.setTimeout(() => setTheme(next), applyAt);
    window.setTimeout(() => {
      setTransition(null);
      locking.current = false;
    }, doneAt);
  }, [theme]);

  return { theme, toggleTheme, transition, transitionGo };
}
