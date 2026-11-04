import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

const ease = [0.34, 1.3, 0.64, 1];

const openVariants = {
  initial: { rotateY: 0, x: 0, opacity: 1 },
  exit: (mobile) =>
    mobile
      ? { x: '-100%', opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }
      : { rotateY: -115, opacity: [1, 1, 0], transition: { duration: 0.9, ease } },
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Deterministic-ish paper slice seeds (no Math.random on each render). */
const PAPER_SEEDS = [
  { x: -62, y: -48, r: -38, rx: 55, ry: -20, delay: 0.02, w: 9.5, h: 13 },
  { x: 58, y: -42, r: 42, rx: -40, ry: 30, delay: 0.08, w: 8.5, h: 12 },
  { x: -48, y: 38, r: 28, rx: 25, ry: -45, delay: 0.14, w: 10, h: 14 },
  { x: 52, y: 44, r: -52, rx: -30, ry: 20, delay: 0.05, w: 9, h: 12.5 },
  { x: -18, y: -58, r: 18, rx: 60, ry: 10, delay: 0.18, w: 11, h: 15 },
  { x: 22, y: 55, r: -22, rx: -50, ry: -15, delay: 0.11, w: 8, h: 11 },
  { x: -70, y: 8, r: 65, rx: 15, ry: 55, delay: 0.22, w: 9.5, h: 13.5 },
  { x: 68, y: -8, r: -48, rx: -25, ry: -40, delay: 0.16, w: 10.5, h: 14 },
  { x: -35, y: -28, r: 12, rx: 45, ry: 25, delay: 0.28, w: 8.5, h: 12 },
  { x: 40, y: 22, r: -15, rx: -35, ry: 35, delay: 0.2, w: 9, h: 13 },
  { x: -8, y: 48, r: 50, rx: 20, ry: -55, delay: 0.1, w: 10, h: 13.5 },
  { x: 12, y: -40, r: -60, rx: -55, ry: 15, delay: 0.25, w: 8, h: 11.5 },
  { x: -55, y: -15, r: 35, rx: 30, ry: -30, delay: 0.32, w: 9.5, h: 12.5 },
  { x: 48, y: -30, r: -28, rx: -20, ry: 45, delay: 0.06, w: 10, h: 14 },
  { x: -25, y: 25, r: 8, rx: 40, ry: 20, delay: 0.3, w: 8.5, h: 12 },
  { x: 30, y: -55, r: -40, rx: -45, ry: -25, delay: 0.12, w: 9, h: 13 },
];

/**
 * Intro phases:
 * scatter  — paper slices fly + twirl in
 * assemble — slices gather into a horizontal book
 * tilt     — book tips from flat (facing up) to upright (facing user)
 * zoom     — book comes forward into the full cover
 * ready    — interactive cover (current site start)
 */
export default function BookCover({ onOpen, behind = false }) {
  const [phase, setPhase] = useState(() =>
    prefersReducedMotion() ? 'ready' : 'scatter',
  );

  const papers = useMemo(() => PAPER_SEEDS, []);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const timers = [
      window.setTimeout(() => setPhase('assemble'), 1600),
      window.setTimeout(() => setPhase('tilt'), 2800),
      window.setTimeout(() => setPhase('zoom'), 3800),
      window.setTimeout(() => setPhase('ready'), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Open interactions only once the cover is ready.
  useEffect(() => {
    if (phase !== 'ready') return undefined;

    let startY = null;
    const onWheel = (e) => e.deltaY > 8 && onOpen();
    const onKey = (e) =>
      ['Enter', ' ', 'ArrowDown', 'ArrowRight'].includes(e.key) && onOpen();
    const onStart = (e) => {
      startY = e.touches[0].clientY;
    };
    const onMove = (e) =>
      startY !== null && Math.abs(startY - e.touches[0].clientY) > 30 && onOpen();
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
    };
  }, [onOpen, phase]);

  const showIntro = phase !== 'ready';
  const bookPose =
    phase === 'scatter'
      ? 'scatter'
      : phase === 'assemble'
        ? 'flat'
        : phase === 'tilt'
          ? 'upright'
          : 'forward';

  return (
    <div
      className="cover-stage"
      style={behind ? { zIndex: 90 } : undefined}
      data-phase={phase}
    >
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            className="cover-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="cover-intro__space">
              {papers.map((p, i) => {
                const stacked = {
                  x: ((i % 5) - 2) * 2.5,
                  y: Math.floor(i / 5) * -1.2 - 2,
                  rotate: ((i % 3) - 1) * 2.5,
                  rotateX: 72,
                  rotateY: ((i % 4) - 1.5) * 3,
                  scale: 1,
                };

                return (
                  <motion.span
                    key={i}
                    className="cover-intro__paper"
                    style={{
                      width: `${p.w}rem`,
                      height: `${p.h}rem`,
                      zIndex: i + 1,
                    }}
                    initial={{
                      x: `${p.x}vw`,
                      y: `${p.y}vh`,
                      rotate: p.r * 2,
                      rotateX: p.rx,
                      rotateY: p.ry,
                      scale: 0.55,
                      opacity: 0,
                    }}
                    animate={
                      phase === 'scatter'
                        ? {
                            x: [`${p.x}vw`, `${p.x * 0.55}vw`, `${p.x * 0.2}vw`],
                            y: [`${p.y}vh`, `${p.y * 0.4}vh`, `${p.y * 0.15}vh`],
                            rotate: [p.r * 2, p.r * -1.2, p.r * 0.4],
                            rotateX: [p.rx, p.rx * -0.6, p.rx * 0.3],
                            rotateY: [p.ry, p.ry * -0.8, p.ry * 0.2],
                            scale: [0.55, 1.05, 0.95],
                            opacity: [0, 1, 1],
                          }
                        : {
                            x: stacked.x,
                            y: stacked.y,
                            rotate: stacked.rotate,
                            rotateX: stacked.rotateX,
                            rotateY: stacked.rotateY,
                            scale: stacked.scale,
                            opacity: phase === 'zoom' ? 0 : 1,
                          }
                    }
                    transition={
                      phase === 'scatter'
                        ? {
                            duration: 1.45,
                            delay: p.delay,
                            ease: [0.22, 1, 0.36, 1],
                          }
                        : {
                            duration: 0.95,
                            delay: i * 0.018,
                            ease: [0.34, 1.1, 0.64, 1],
                          }
                    }
                  />
                );
              })}

              <motion.div
                className="cover-intro__book"
                initial={{ opacity: 0, scale: 0.85, rotateX: 78, rotateY: -8, z: -80 }}
                animate={
                  bookPose === 'scatter'
                    ? { opacity: 0, scale: 0.7, rotateX: 78, rotateY: -8, z: -120 }
                    : bookPose === 'flat'
                      ? { opacity: 1, scale: 0.92, rotateX: 72, rotateY: -6, z: 0 }
                      : bookPose === 'upright'
                        ? { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, z: 40 }
                        : { opacity: 0, scale: 2.4, rotateX: 0, rotateY: 0, z: 280 }
                }
                transition={{ duration: bookPose === 'forward' ? 0.95 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cover-intro__book-cover">
                  <span className="cover-intro__book-title">Maxwell Peng</span>
                  <span className="cover-intro__book-sub">builder, founder, student</span>
                </div>
                <div className="cover-intro__book-pages" aria-hidden />
                <div className="cover-intro__book-spine" aria-hidden />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="cover"
        custom={isMobile()}
        variants={openVariants}
        initial="initial"
        exit="exit"
        onClick={phase === 'ready' ? onOpen : undefined}
        role="button"
        tabIndex={phase === 'ready' ? 0 : -1}
        aria-label="Open"
        aria-hidden={phase !== 'ready'}
        style={{
          pointerEvents: phase === 'ready' ? 'auto' : 'none',
        }}
        animate={
          phase === 'ready'
            ? { opacity: 1, scale: 1 }
            : phase === 'zoom'
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.92 }
        }
        transition={{ duration: phase === 'zoom' ? 0.85 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cover__frame" />
        <div className="cover__center">
          <h1 className="cover__name">Maxwell Peng</h1>
          <p className="cover__sub">builder, founder, student</p>
        </div>
        {phase === 'ready' && (
          <motion.span
            className="cover__open"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            open <ChevronRight size={14} />
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
