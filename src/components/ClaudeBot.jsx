import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const LINGER_MS = 3200;
const FLEE_RADIUS = 140;
const BASE_PUSH = 4.5;
const SPEED_PUSH = 0.045; // extra push from cursor speed (px/ms)
const MAX_STEP = 11; // hard cap per frame — keeps it from rocketing
const MARGIN = 12;
const BOT_W = 36;
const BOT_H = 32;

function ClaudeSprite({ size = 36 }) {
  return (
    <svg
      className="claude-bot__sprite"
      width={size}
      height={size}
      viewBox="0 0 32 28"
      fill="none"
      aria-hidden
    >
      <rect x="6" y="4" width="20" height="14" rx="1" fill="currentColor" />
      <rect x="11" y="8" width="3" height="5" rx="0.5" fill="#fff" />
      <rect x="18" y="8" width="3" height="5" rx="0.5" fill="#fff" />
      <rect x="2" y="10" width="4" height="3" rx="0.5" fill="currentColor" />
      <rect x="26" y="10" width="4" height="3" rx="0.5" fill="currentColor" />
      <rect x="8" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="12" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="17" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="21" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Peeks in after a linger, bounces around, and skitters away from the cursor
 * (faster approach → a bit more panic, but always capped).
 */
export default function ClaudeBot({ sectionKey, active }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const [fleeing, setFleeing] = useState(false);
  const botRef = useRef(null);
  const posRef = useRef(pos);
  const mouseRef = useRef({ x: 0, y: 0, t: 0 });
  const rafRef = useRef(0);
  const pendingRef = useRef(null);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    setVisible(false);
    setReady(false);
    setSettled(false);
    setFleeing(false);
    if (!active || reduce) return undefined;
    const t = setTimeout(() => setVisible(true), LINGER_MS);
    return () => clearTimeout(t);
  }, [sectionKey, active, reduce]);

  const placeInitial = useCallback(() => {
    const root = botRef.current?.offsetParent;
    if (!root) return;
    const w = root.clientWidth;
    const h = root.clientHeight;
    setPos({
      x: w - BOT_W - Math.max(MARGIN, 44),
      y: h - BOT_H - Math.max(MARGIN, 72),
    });
    setReady(true);
    requestAnimationFrame(() => setSettled(true));
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const id = requestAnimationFrame(placeInitial);
    return () => cancelAnimationFrame(id);
  }, [visible, placeInitial]);

  useEffect(() => {
    if (!visible || !ready) return undefined;

    const applyFlee = (mx, my, cursorSpeed) => {
      const root = botRef.current?.offsetParent;
      if (!root) return;
      const { x, y } = posRef.current;
      const cx = x + BOT_W / 2;
      const cy = y + BOT_H / 2;
      const dx = cx - mx;
      const dy = cy - my;
      const dist = Math.hypot(dx, dy);

      if (dist >= FLEE_RADIUS || dist === 0) {
        setFleeing(false);
        return;
      }

      setFleeing(true);
      // Closer = more push; faster cursor = a little more, then hard-capped.
      const proximity = (FLEE_RADIUS - dist) / FLEE_RADIUS;
      const push = Math.min(MAX_STEP, BASE_PUSH * proximity + cursorSpeed * SPEED_PUSH * proximity);
      const nx = dx / dist;
      const ny = dy / dist;
      const maxX = root.clientWidth - BOT_W - MARGIN;
      const maxY = root.clientHeight - BOT_H - MARGIN;
      setPos({
        x: clamp(x + nx * push, MARGIN, maxX),
        y: clamp(y + ny * push, MARGIN, maxY),
      });
    };

    const onMove = (e) => {
      const root = botRef.current?.offsetParent;
      if (!root) return;
      const bounds = root.getBoundingClientRect();
      const mx = e.clientX - bounds.left;
      const my = e.clientY - bounds.top;
      const now = performance.now();
      const prev = mouseRef.current;
      const dt = Math.max(8, now - (prev.t || now));
      const cursorSpeed = prev.t ? Math.hypot(mx - prev.x, my - prev.y) / dt : 0;
      mouseRef.current = { x: mx, y: my, t: now };

      pendingRef.current = { mx, my, cursorSpeed };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const p = pendingRef.current;
        if (p) applyFlee(p.mx, p.my, p.cursorSpeed);
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, ready]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={botRef}
          className={`claude-bot${fleeing ? ' claude-bot--fleeing' : ''}`}
          aria-hidden
          initial={{ opacity: 0, scale: 0.55, rotate: -8 }}
          animate={{
            opacity: ready ? 1 : 0,
            scale: fleeing ? 1.04 : 1,
            left: pos.x,
            top: pos.y,
          }}
          exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { type: 'spring', stiffness: 380, damping: 18 },
            left: settled
              ? { type: 'spring', stiffness: 140, damping: 18, mass: 0.9 }
              : { duration: 0 },
            top: settled
              ? { type: 'spring', stiffness: 140, damping: 18, mass: 0.9 }
              : { duration: 0 },
          }}
        >
          <motion.div
            className="claude-bot__bounce"
            animate={
              fleeing
                ? { y: [0, -3, 0], rotate: [0, -10, 10, -6, 0] }
                : { y: [0, -9, 0, -5, 0], rotate: [0, -5, 4, -2, 0] }
            }
            transition={
              fleeing
                ? { duration: 0.35, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <ClaudeSprite />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
