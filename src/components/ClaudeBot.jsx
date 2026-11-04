import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

const LINGER_MS = 3200;

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
      {/* body */}
      <rect x="6" y="4" width="20" height="14" rx="1" fill="currentColor" />
      {/* eyes */}
      <rect x="11" y="8" width="3" height="5" rx="0.5" fill="#fff" />
      <rect x="18" y="8" width="3" height="5" rx="0.5" fill="#fff" />
      {/* arms */}
      <rect x="2" y="10" width="4" height="3" rx="0.5" fill="currentColor" />
      <rect x="26" y="10" width="4" height="3" rx="0.5" fill="currentColor" />
      {/* legs — four stubs */}
      <rect x="8" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="12" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="17" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="21" y="18" width="3" height="6" rx="0.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Peeks in after the user lingers on a section, then bounces / wanders around.
 */
export default function ClaudeBot({ sectionKey, active }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (!active || reduce) return undefined;
    const t = setTimeout(() => setVisible(true), LINGER_MS);
    return () => clearTimeout(t);
  }, [sectionKey, active, reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="claude-bot"
          aria-hidden
          initial={{ opacity: 0, y: 28, scale: 0.55, rotate: -8 }}
          animate={{
            opacity: 1,
            y: [0, -10, 0, -6, 0],
            x: [0, 14, 8, -10, 0, 6, 0],
            scale: 1,
            rotate: [0, -6, 4, -3, 0, 5, 0],
          }}
          exit={{ opacity: 0, y: 16, scale: 0.7, transition: { duration: 0.25 } }}
          transition={{
            opacity: { duration: 0.35 },
            scale: { type: 'spring', stiffness: 420, damping: 16 },
            y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.35 },
            x: { duration: 7.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 },
            rotate: { duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.35 },
          }}
        >
          <ClaudeSprite />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
