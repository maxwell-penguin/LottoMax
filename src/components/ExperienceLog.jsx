import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { experienceData } from '@/data/content';
import TerminalWindow, { Prompt } from '@/components/TerminalWindow';

// Display slugs; anything not listed falls back to slugify(company).
const SLUGS = {
  'AtlasHaus Design': 'atlashaus',
  'Western Founders Network': 'wfn',
  'Team Canada | Badminton': 'team-canada',
};
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// "August 2026 – Present" -> "2026-08"
function startDate(period) {
  const [m, y] = period.split(/[–-]/)[0].trim().split(/\s+/);
  return `${y}-${String(MONTHS.indexOf(m.toLowerCase()) + 1).padStart(2, '0')}`;
}

export default function ExperienceLog() {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="tab-panel tab-panel--list">
      <TerminalWindow title="maxwell — logs — 80x24" className="tw--wide">
        <Prompt>tail -n {experienceData.length} experience.log</Prompt>
        <ul className="xlog">
          {experienceData.map((exp) => {
            const running = /present/i.test(exp.period);
            const isOpen = open.has(exp.id);
            return (
              <li key={exp.id} className="xlog__item">
                <button
                  type="button"
                  className="xlog__row"
                  onClick={() => toggle(exp.id)}
                  aria-expanded={isOpen}
                >
                  <span className="xlog__date">[{startDate(exp.period)}]</span>
                  <span className="xlog__slug">{SLUGS[exp.company] ?? slugify(exp.company)}</span>
                  <span className={`xlog__status ${running ? 'is-running' : 'is-stopped'}`}>
                    {running ? 'RUNNING' : 'STOPPED'}
                  </span>
                  <span className="xlog__role">{slugify(exp.role)}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="xlog__detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="xlog__detail-inner">
                        <p className="xlog__period">{exp.period}</p>
                        <p className="xlog__summary">// {exp.description}</p>
                        <ul className="xlog__bullets">
                          {exp.achievements.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                        <p className="xlog__tags">
                          {exp.tech.map((t) => (
                            <span key={t}>[{t}]</span>
                          ))}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </TerminalWindow>
    </div>
  );
}
