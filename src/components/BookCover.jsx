import { motion } from 'motion/react';
import { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

const ease = [0.34, 1.3, 0.64, 1]; // slight overshoot

// ponytail: variants are picked at open time via `custom`; no resize listener.
const variants = {
  initial: { rotateY: 0, x: 0, opacity: 1 },
  exit: (mobile) =>
    mobile
      ? { x: '-100%', opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }
      : { rotateY: -115, opacity: [1, 1, 0], transition: { duration: 0.9, ease } },
};

export default function BookCover({ onOpen, behind = false }) {
  useEffect(() => {
    let startY = null;
    const onWheel = (e) => e.deltaY > 8 && onOpen();
    const onKey = (e) => ['Enter', ' ', 'ArrowDown', 'ArrowRight'].includes(e.key) && onOpen();
    const onStart = (e) => (startY = e.touches[0].clientY);
    const onMove = (e) => startY !== null && Math.abs(startY - e.touches[0].clientY) > 30 && onOpen();
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
  }, [onOpen]);

  return (
    <div className="cover-stage" style={behind ? { zIndex: 90 } : undefined}>
      <motion.div
        className="cover"
        custom={isMobile()}
        variants={variants}
        initial="initial"
        exit="exit"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label="Open"
      >
        <div className="cover__frame" />
        <div className="cover__center">
          <h1 className="cover__name">Maxwell Peng</h1>
          <p className="cover__sub">builder, founder, student</p>
        </div>
        <motion.span
          className="cover__open"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          open <ChevronRight size={14} />
        </motion.span>
      </motion.div>
    </div>
  );
}
