import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const LINGER_MS = 3200;
const FLEE_RADIUS = 120;
const FLEE_STRENGTH = 32;
const MARGIN = 16;
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
 * Peeks in after a linger, bounces around, and runs away from the cursor.
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
    // Enable springs only after the first paint at the corner.
    requestAnimationFrame(() => setSettled(true));
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const id = requestAnimationFrame(placeInitial);
    return () => cancelAnimationFrame(id);
  }, [visible, placeInitial]);

  useEffect(() => {
    if (!visible || !ready) return undefined;

    const onMove = (e) => {
      const root = botRef.current?.offsetParent;
      if (!root) return;
      const bounds = root.getBoundingClientRect();
      const mx = e.clientX - bounds.left;
      const my = e.clientY - bounds.top;
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
      const push = ((FLEE_RADIUS - dist) / FLEE_RADIUS) * FLEE_STRENGTH;
      const nx = dx / dist;
      const ny = dy / dist;
      const maxX = root.clientWidth - BOT_W - MARGIN;
      const maxY = root.clientHeight - BOT_H - MARGIN;
      setPos({
        x: clamp(x + nx * push, MARGIN, maxX),
        y: clamp(y + ny * push, MARGIN, maxY),
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
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
            scale: fleeing ? 1.06 : 1,
            left: pos.x,
            top: pos.y,
          }}
          exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { type: 'spring', stiffness: 420, damping: 16 },
            left: settled
              ? { type: 'spring', stiffness: 320, damping: 20, mass: 0.55 }
              : { duration: 0 },
            top: settled
              ? { type: 'spring', stiffness: 320, damping: 20, mass: 0.55 }
              : { duration: 0 },
          }}
        >
          <motion.div
            className="claude-bot__bounce"
            animate={
              fleeing
                ? { y: [0, -4, 0], rotate: [0, -12, 12, -8, 0] }
                : { y: [0, -9, 0, -5, 0], rotate: [0, -5, 4, -2, 0] }
            }
            transition={
              fleeing
                ? { duration: 0.28, repeat: Infinity, ease: 'easeInOut' }
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
