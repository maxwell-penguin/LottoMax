import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/** Deterministic paper slice seeds. */
const PAPER_SEEDS = [
  { x: -72, y: -52, r: -48, rx: 70, ry: -35, delay: 0.0, w: 9.5, h: 13 },
  { x: 68, y: -46, r: 55, rx: -55, ry: 40, delay: 0.1, w: 8.5, h: 12 },
  { x: -58, y: 46, r: 38, rx: 35, ry: -60, delay: 0.18, w: 10, h: 14 },
  { x: 62, y: 50, r: -62, rx: -40, ry: 28, delay: 0.06, w: 9, h: 12.5 },
  { x: -22, y: -68, r: 28, rx: 75, ry: 18, delay: 0.24, w: 11, h: 15 },
  { x: 28, y: 64, r: -34, rx: -65, ry: -22, delay: 0.14, w: 8, h: 11 },
  { x: -80, y: 6, r: 78, rx: 20, ry: 70, delay: 0.3, w: 9.5, h: 13.5 },
  { x: 78, y: -12, r: -58, rx: -32, ry: -52, delay: 0.2, w: 10.5, h: 14 },
  { x: -42, y: -32, r: 16, rx: 58, ry: 32, delay: 0.36, w: 8.5, h: 12 },
  { x: 48, y: 28, r: -22, rx: -48, ry: 48, delay: 0.26, w: 9, h: 13 },
  { x: -12, y: 58, r: 64, rx: 28, ry: -70, delay: 0.12, w: 10, h: 13.5 },
  { x: 16, y: -48, r: -72, rx: -70, ry: 22, delay: 0.32, w: 8, h: 11.5 },
  { x: -64, y: -18, r: 44, rx: 42, ry: -38, delay: 0.4, w: 9.5, h: 12.5 },
  { x: 56, y: -36, r: -36, rx: -28, ry: 58, delay: 0.08, w: 10, h: 14 },
  { x: -30, y: 32, r: 12, rx: 52, ry: 26, delay: 0.38, w: 8.5, h: 12 },
  { x: 36, y: -62, r: -50, rx: -58, ry: -30, delay: 0.16, w: 9, h: 13 },
  { x: -50, y: 18, r: -18, rx: 25, ry: 45, delay: 0.22, w: 10.5, h: 14.5 },
  { x: 44, y: 12, r: 30, rx: -22, ry: -42, delay: 0.28, w: 8.5, h: 12 },
];

/**
 * scatter → assemble → merge (papers gone, solid book) → tilt → zoom → ready
 */
export default function BookCover({ onOpen, behind = false }) {
  const [phase, setPhase] = useState(() =>
    prefersReducedMotion() ? 'ready' : 'scatter',
  );
  const timersRef = useRef([]);
  const papers = useMemo(() => PAPER_SEEDS, []);
  // Scale that makes each (differently sized) flying paper the same size as the book cover,
  // so the assembled stack reads as one set of pages under the cover, not small stray sheets.
  const stackScale = useMemo(() => {
    const bookW = Math.min(window.innerWidth * 0.42, 280);
    const bookH = Math.min(window.innerWidth * 0.58, 380);
    return papers.map((p) => Math.sqrt((bookW * bookH) / (p.w * 16 * p.h * 16)));
  }, [papers]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const skipToCover = useCallback(() => {
    clearTimers();
    setPhase('ready');
  }, [clearTimers]);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    clearTimers();
    timersRef.current = [
      window.setTimeout(() => setPhase('assemble'), 2200),
      window.setTimeout(() => setPhase('merge'), 3800),
      window.setTimeout(() => setPhase('tilt'), 4600),
      window.setTimeout(() => setPhase('zoom'), 6200),
      window.setTimeout(() => setPhase('ready'), 7600),
    ];
    return clearTimers;
  }, [clearTimers]);

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
  const showPapers = phase === 'scatter' || phase === 'assemble' || phase === 'merge';

  const bookPose =
    phase === 'scatter'
      ? 'hidden'
      : phase === 'assemble' || phase === 'merge'
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
            transition={{ duration: 0.45 }}
          >
            <div className="cover-intro__space">
              <AnimatePresence>
                {showPapers &&
                  papers.map((p, i) => {
                    const stacked = {
                      x: ((i % 6) - 2.5) * 1.8,
                      y: Math.floor(i / 6) * -0.9 - 1,
                      rotate: ((i % 3) - 1) * 1.5,
                      rotateX: 74,
                      rotateY: ((i % 4) - 1.5) * 2,
                      scale: stackScale[i] * 0.94,
                    };

                    return (
                      <motion.span
                        key={i}
                        className="cover-intro__paper"
                        style={{
                          width: `${p.w}rem`,
                          height: `${p.h}rem`,
                          // center each paper on its own size (the CSS margin assumed 9x12rem)
                          marginLeft: `${-p.w / 2}rem`,
                          marginTop: `${-p.h / 2}rem`,
                          zIndex: i + 1,
                        }}
                        initial={{
                          x: `${p.x}vw`,
                          y: `${p.y}vh`,
                          rotate: p.r * 2.4,
                          rotateX: p.rx,
                          rotateY: p.ry,
                          scale: 0.4,
                          opacity: 0,
                        }}
                        animate={
                          phase === 'scatter'
                            ? {
                                x: [
                                  `${p.x}vw`,
                                  `${p.x * 0.7}vw`,
                                  `${p.x * -0.15}vw`,
                                  `${p.x * 0.25}vw`,
                                ],
                                y: [
                                  `${p.y}vh`,
                                  `${p.y * 0.55}vh`,
                                  `${p.y * -0.1}vh`,
                                  `${p.y * 0.2}vh`,
                                ],
                                rotate: [p.r * 2.4, p.r * -1.8, p.r * 1.2, p.r * 0.35],
                                rotateX: [p.rx, p.rx * -0.85, p.rx * 0.5, p.rx * 0.25],
                                rotateY: [p.ry, p.ry * -1.1, p.ry * 0.6, p.ry * 0.2],
                                scale: [0.4, 1.15, 0.9, 1],
                                opacity: [0, 1, 1, 1],
                              }
                            : phase === 'assemble'
                              ? {
                                  ...stacked,
                                  opacity: 1,
                                }
                              : {
                                  ...stacked,
                                  opacity: 0,
                                  scale: stackScale[i] * 0.87,
                                }
                        }
                        exit={{ opacity: 0, scale: stackScale[i] * 0.8, transition: { duration: 0.35 } }}
                        transition={
                          phase === 'scatter'
                            ? {
                                duration: 2.05,
                                delay: p.delay,
                                ease: [0.22, 1, 0.36, 1],
                              }
                            : phase === 'assemble'
                              ? {
                                  duration: 1.25,
                                  delay: i * 0.022,
                                  ease: [0.34, 1.05, 0.64, 1],
                                }
                              : {
                                  duration: 0.55,
                                  delay: i * 0.012,
                                  ease: [0.4, 0, 0.2, 1],
                                }
                        }
                      />
                    );
                  })}
              </AnimatePresence>

              <motion.div
                className="cover-intro__book"
                style={{ zIndex: 50 }}
                initial={{ opacity: 0, scale: 0.75, rotateX: 82, rotateY: -10, z: -100 }}
                animate={
                  bookPose === 'hidden'
                    ? { opacity: 0, scale: 0.7, rotateX: 82, rotateY: -10, z: -100 }
                    : bookPose === 'flat'
                      ? {
                          opacity: 1,
                          scale: phase === 'merge' ? 1 : 0.94,
                          rotateX: 74,
                          rotateY: -5,
                          z: 0,
                        }
                      : bookPose === 'upright'
                        ? { opacity: 1, scale: 1.05, rotateX: 0, rotateY: 0, z: 60 }
                        : { opacity: 0, scale: 2.6, rotateX: 0, rotateY: 0, z: 320 }
                }
                transition={{
                  duration:
                    bookPose === 'forward' ? 1.15 : bookPose === 'upright' ? 1.35 : 0.95,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="cover-intro__book-cover">
                  <span className="cover-intro__book-title">Maxwell Peng</span>
                  <span className="cover-intro__book-sub">builder, founder, student</span>
                </div>
                <div className="cover-intro__book-pages" aria-hidden />
                <div className="cover-intro__book-spine" aria-hidden />
              </motion.div>
            </div>

            <button
              type="button"
              className="cover-intro__skip"
              onClick={skipToCover}
            >
              skip
            </button>
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
          phase === 'ready' || phase === 'zoom'
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.92 }
        }
        transition={{ duration: phase === 'zoom' ? 1.05 : 0.4, ease: [0.22, 1, 0.36, 1] }}
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
