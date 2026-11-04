import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const LINGER_MS = 3200;
const FLEE_RADIUS = 130;
const FLEE_SPEED = 3.2; // constant px per frame — same pace every time
const MARGIN = 10;
const BOT_W = 36;
const BOT_H = 32;
const OFFSCREEN_CHANCE = 0.012; // rare; checked while pinned against an edge
const OFFSCREEN_PAD = 56; // how far past the edge it can slip
const RETURN_MS = 1400;

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
 * Lingers in, then skitters away at a steady pace — usually stays on-page,
 * occasionally slips off an edge before coming back.
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
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const allowOffRef = useRef(false);
  const returnTimerRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    setVisible(false);
    setReady(false);
    setSettled(false);
    setFleeing(false);
    allowOffRef.current = false;
    if (!active || reduce) return undefined;
    const t = setTimeout(() => setVisible(true), LINGER_MS);
    return () => clearTimeout(t);
  }, [sectionKey, active, reduce]);

  const placeInitial = useCallback(() => {
    const root = botRef.current?.offsetParent;
    if (!root) return;
    setPos({
      x: root.clientWidth - BOT_W - Math.max(MARGIN, 44),
      y: root.clientHeight - BOT_H - Math.max(MARGIN, 72),
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

    const boundsFor = (root) => {
      if (allowOffRef.current) {
        return {
          minX: -OFFSCREEN_PAD,
          maxX: root.clientWidth - BOT_W + OFFSCREEN_PAD,
          minY: -OFFSCREEN_PAD,
          maxY: root.clientHeight - BOT_H + OFFSCREEN_PAD,
        };
      }
      return {
        minX: MARGIN,
        maxX: root.clientWidth - BOT_W - MARGIN,
        minY: MARGIN,
        maxY: root.clientHeight - BOT_H - MARGIN,
      };
    };

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const root = botRef.current?.offsetParent;
      if (!root) return;

      const { x, y } = posRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = x + BOT_W / 2;
      const cy = y + BOT_H / 2;
      const dx = cx - mx;
      const dy = cy - my;
      const dist = Math.hypot(dx, dy);

      if (dist >= FLEE_RADIUS || dist === 0) {
        setFleeing((f) => (f ? false : f));
        return;
      }

      setFleeing(true);

      // Constant-speed escape away from the cursor (any direction).
      const nx = dx / dist;
      const ny = dy / dist;
      let nextX = x + nx * FLEE_SPEED;
      let nextY = y + ny * FLEE_SPEED;

      const b = boundsFor(root);
      const hitEdge =
        nextX <= b.minX || nextX >= b.maxX || nextY <= b.minY || nextY >= b.maxY;

      // Usually stay on-page; rarely open a brief off-screen window.
      if (hitEdge && !allowOffRef.current && Math.random() < OFFSCREEN_CHANCE) {
        allowOffRef.current = true;
        window.clearTimeout(returnTimerRef.current);
        returnTimerRef.current = window.setTimeout(() => {
          allowOffRef.current = false;
          const root2 = botRef.current?.offsetParent;
          if (!root2) return;
          setPos((p) => ({
            x: clamp(p.x, MARGIN, root2.clientWidth - BOT_W - MARGIN),
            y: clamp(p.y, MARGIN, root2.clientHeight - BOT_H - MARGIN),
          }));
        }, RETURN_MS);
      }

      const lim = boundsFor(root);
      nextX = clamp(nextX, lim.minX, lim.maxX);
      nextY = clamp(nextY, lim.minY, lim.maxY);

      if (nextX !== x || nextY !== y) {
        setPos({ x: nextX, y: nextY });
      }
    };

    const onMove = (e) => {
      const root = botRef.current?.offsetParent;
      if (!root) return;
      const bounds = root.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      };
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(returnTimerRef.current);
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
              ? { type: 'spring', stiffness: 220, damping: 24, mass: 0.7 }
              : { duration: 0 },
            top: settled
              ? { type: 'spring', stiffness: 220, damping: 24, mass: 0.7 }
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
