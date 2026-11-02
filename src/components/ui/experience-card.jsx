import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const STAGGER = [0, 1, 0.5, 1.5]; // seconds, by grid index
const HOLD_MS = 3000;
const fade = { duration: 0.6, ease: 'easeInOut' };

export function ExperienceCard({ exp, index }) {
  const [showInfo, setShowInfo] = useState(false);
  const [open, setOpen] = useState(false);

  // Flip every HOLD_MS after a staggered start; stops for good once opened.
  useEffect(() => {
    if (open) return;
    let id;
    const start = setTimeout(() => {
      setShowInfo((v) => !v);
      id = setInterval(() => setShowInfo((v) => !v), HOLD_MS);
    }, HOLD_MS + STAGGER[index % STAGGER.length] * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="xc" onClick={() => setOpen(true)} aria-label={`${exp.role}, ${exp.company}`}>
        <AnimatePresence initial={false}>
          {showInfo ? (
            <motion.div key="info" className="xc__face xc__info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
              <h3 className="xc__role">{exp.role}</h3>
              <p className="xc__company">{exp.company}</p>
              <p className="xc__period">{exp.period}</p>
            </motion.div>
          ) : (
            <motion.div key="logo" className="xc__face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
              <img src={exp.image} alt={exp.company} className="xc__logo" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="xc-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
              <motion.div
                className="xc-modal"
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" className="xc-modal__close" onClick={() => setOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
                <h3 className="xc__role xc__role--lg">{exp.role}</h3>
                <p className="xc__company">{exp.company}</p>
                <p className="xc__period">{exp.period}</p>
                <p className="xc-modal__summary">{exp.description}</p>
                <ul className="xc-modal__list">
                  {exp.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
                <div className="xc-modal__tags">
                  {exp.tech.map((t) => (
                    <span key={t} className="xc-modal__tag">{t}</span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
