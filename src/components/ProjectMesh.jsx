import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import TerminalWindow, { Prompt } from '@/components/TerminalWindow';

// Hand-placed loose layout (x, y = node center in % of the cluster box; r = radius px).
// Keyed by project title so reordering the data never moves nodes around.
const LAYOUT = {
  'SketchStorm Studio': { abbr: 'SS', x: 40, y: 14, r: 34 },
  'DealFlow AI': { abbr: 'DF', x: 16, y: 26, r: 38 },
  Vigil: { abbr: 'VG', x: 66, y: 16, r: 30 },
  'Dice AI': { abbr: 'DA', x: 88, y: 32, r: 36 },
  'Interview Royale': { abbr: 'IR', x: 52, y: 46, r: 40 },
  Defrost: { abbr: 'DR', x: 76, y: 60, r: 32 },
  RacketSense: { abbr: 'RS', x: 24, y: 56, r: 30 },
  StockTok: { abbr: 'ST', x: 14, y: 84, r: 34 },
  'WFN Projects Website': { abbr: 'WP', x: 38, y: 82, r: 28 },
  DayFlow: { abbr: 'DY', x: 64, y: 86, r: 34 },
};

// Mesh lines: pairs that genuinely share tech or context (not a hub).
const LINKS = [
  ['DealFlow AI', 'SketchStorm Studio'], // both multi-agent LLM pipelines (6 agents, FastAPI)
  ['SketchStorm Studio', 'Interview Royale'], // real-time FastAPI + WebSockets apps built around LLMs
  ['Dice AI', 'Defrost'], // Next.js/TypeScript products with LLM features, both live
  ['StockTok', 'WFN Projects Website'], // both built through Western Founders Network
];

const isLive = (link) => !!link && link !== '#' && !link.includes('github.com');
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Detail({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const hasLink = project.link && project.link !== '#';
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 mesh-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="mesh-detail"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="mesh-detail__close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <TerminalWindow title={`maxwell — ${slug(project.title)} — 80x24`} className="mesh-detail__win">
          <Prompt>cat projects/{slug(project.title)}.md</Prompt>
          <h3 className="mesh-detail__title" style={{ '--c': project.color }}>
            # {project.title}
            {isLive(project.link) && <span className="mesh-detail__live">live</span>}
          </h3>
          <p className="mesh-detail__desc">{project.description}</p>

          {project.highlights?.length > 0 && (
            <>
              <h4 className="mesh-detail__h">## highlights</h4>
              <ul className="xlog__bullets">
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </>
          )}

          <h4 className="mesh-detail__h">## stack</h4>
          <p className="xlog__tags">
            {project.tech.map((t) => (
              <span key={t}>[{t}]</span>
            ))}
          </p>

          {hasLink && (
            <p className="mesh-detail__link">
              <span className="tw__prompt">$</span> open{' '}
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                View project →
              </a>
            </p>
          )}
        </TerminalWindow>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export default function ProjectMesh({ projects }) {
  const [open, setOpen] = useState(null); // project
  const [hover, setHover] = useState(null); // title

  const nodes = projects.filter((p) => LAYOUT[p.title]);
  const at = (title) => LAYOUT[title];

  return (
    <div className="tab-panel tab-panel--list tab-panel--projects">
      <div className="mesh__scroll">
        <div className="mesh" role="group" aria-label="Project cluster">
          <svg className="mesh__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {LINKS.map(([a, b]) => (
              <line
                key={a + b}
                x1={at(a).x}
                y1={at(a).y}
                x2={at(b).x}
                y2={at(b).y}
                className={hover === a || hover === b ? 'is-hot' : ''}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {nodes.map((p) => {
            const L = at(p.title);
            const live = isLive(p.link);
            const tipV = L.y >= 40 ? 'up' : 'down';
            const tipH = L.x < 20 ? 'left' : L.x > 75 ? 'right' : 'mid';
            return (
              <button
                key={p.title}
                type="button"
                className={`mesh__node${live ? ' is-live' : ''}`}
                style={{ left: `${L.x}%`, top: `${L.y}%`, '--r': `${L.r}px`, '--c': p.color }}
                onClick={() => setOpen(p)}
                onMouseEnter={() => setHover(p.title)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.title)}
                onBlur={() => setHover(null)}
                aria-label={`${p.title}${live ? ' (live)' : ''}`}
              >
                <span className="mesh__circle">
                  <span className="mesh__abbr">{L.abbr}</span>
                  {live && <span className="mesh__dot" aria-hidden />}
                </span>
                <span className="mesh__label">{p.title}</span>
                <span className={`mesh__tip mesh__tip--${tipV} mesh__tip--${tipH}`} role="tooltip">
                  <strong>{p.title}</strong>
                  <span>{p.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mesh__hint">// click a node for details</p>

      <AnimatePresence>
        {open && <Detail key={open.title} project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
