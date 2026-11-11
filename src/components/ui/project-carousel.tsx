import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, RotateCcw, X } from 'lucide-react';
import { ExpandableTag } from '@/components/ui/expandable-card';
import { cn } from '@/lib/utils';

// ── Tweakables ─────────────────────────────────────────────────────────────
export const PEEK = {
  HOVER_DELAY_MS: 80, // intent delay before a hover opens the peek
  SCALE: 1.08, // hovered card scale
  DIM_OPACITY: 0.55, // opacity of the other cards while one is peeked
  NEIGHBOR_SHIFT_PX: 36, // how far the adjacent cards slide away (falls off with distance)
  LIFT_PX: 20, // how far the peeked card rises
  RESET_MS: 200, // return-to-rest duration
  PEEK_WIDTH_PX: 336, // peeked card size (resting card is 280 x 416)
  PEEK_HEIGHT_PX: 480,
  PIN_MS: 450, // pinned open/close animation
  BACKDROP_BLUR_PX: 6,
};

export interface ProjectCarouselItem {
  id: number;
  title: string;
  description: string;
  tech: string[];
  link?: string;
  color?: string;
  highlights?: string[];
  image?: string;
}

const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
const SUITS = [
  { glyph: '♠', red: false },
  { glyph: '♥', red: true },
  { glyph: '♦', red: true },
  { glyph: '♣', red: false },
] as const;

const isLiveProject = (link?: string) =>
  !!link && link !== '#' && !link.includes('github.com');

function pipFor(index: number) {
  const rank = RANKS[index % RANKS.length];
  const suit = SUITS[index % SUITS.length];
  return { rank, ...suit };
}

// deck → fan (flourish) → bundle (back into a stack) → deal (staggered) → hand
type Phase = 'deck' | 'fan' | 'bundle' | 'deal' | 'hand';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FAN_MS = 260;
const DEAL_STAGGER = 0.09; // seconds between cards
const CARD_W = 280; // 17.5rem
const CARD_H = 416; // 26rem
const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface PinFrom {
  cx: number;
  cy: number;
  w: number;
  rotate: number;
}

/** Centered detail view. Animates from the hand card's on-screen position (FLIP with transforms). */
function PinnedCard({
  project,
  from,
  onClosed,
}: {
  project: ProjectCarouselItem;
  from: PinFrom;
  onClosed: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const start = useRef<{ x: number; y: number; scale: number; rotate: number } | null>(null);
  const [closing, setClosing] = useState(false);
  const reduce = reducedMotion();
  const secs = PEEK.PIN_MS / 1000;

  useLayoutEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    if (reduce) {
      controls.set({ opacity: 0 });
      controls.start({ opacity: 1, transition: { duration: 0.2 } });
      return;
    }
    const m = el.getBoundingClientRect();
    start.current = {
      x: from.cx - (m.left + m.width / 2),
      y: from.cy - (m.top + m.height / 2),
      scale: from.w / m.width,
      rotate: from.rotate,
    };
    controls.set({ ...start.current, opacity: 0 });
    controls.start({
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: { duration: secs, ease: EASE, opacity: { duration: secs * 0.35 } },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = async () => {
    if (closing) return;
    setClosing(true);
    if (reduce || !start.current) {
      await controls.start({ opacity: 0, transition: { duration: 0.2 } });
    } else {
      await controls.start({
        ...start.current,
        opacity: 0,
        transition: { duration: secs, ease: EASE, opacity: { duration: secs * 0.4, delay: secs * 0.6 } },
      });
    }
    onClosed();
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  const { link } = project;
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      style={{ backdropFilter: `blur(${PEEK.BACKDROP_BLUR_PX}px)`, WebkitBackdropFilter: `blur(${PEEK.BACKDROP_BLUR_PX}px)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.25 }}
      onClick={close}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        animate={controls}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
        className="expandable-card__modal expandable-card__modal--project relative flex w-full flex-col overflow-x-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-0 shadow-lg"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--card-border)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="expandable-card__modal-hero expandable-card__modal-hero--project">
          {project.image ? (
            <div className="expandable-card__hero expandable-card__hero--expanded shrink-0 overflow-hidden">
              <img src={project.image} alt="" className="expandable-card__hero-img" decoding="async" />
              <div className="expandable-card__hero-accent" style={{ backgroundColor: project.color ?? '#E8856A' }} />
            </div>
          ) : null}
        </div>
        <div className="expandable-card__modal-content expandable-card__modal-content--project">
          <h3 className="expandable-card__modal-title pr-10">{project.title}</h3>
          <p className="expandable-card__modal-desc">{project.description}</p>
          <div className="expandable-card__modal-body">
            {project.highlights && project.highlights.length > 0 ? (
              <ul className="project-highlights">
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            <div className="project-tech flex flex-wrap gap-2">
              {project.tech.map((tag) => (
                <ExpandableTag key={tag} label={tag} accentColor={project.color} />
              ))}
            </div>
          </div>
          {link ? (
            <a
              href={link}
              className="expandable-card__modal-link inline-flex items-center gap-1 font-medium text-[var(--accent-forest)] transition-all hover:translate-x-1 hover:text-[var(--text-primary)]"
              {...(link !== '#' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={(e) => {
                if (link === '#') e.preventDefault();
              }}
            >
              View project →
            </a>
          ) : null}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function ProjectCarousel({ projects }: { projects: ProjectCarouselItem[] }) {
  const n = projects.length;
  const center = (n - 1) / 2;

  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'hand'
      : 'deck',
  );
  const [focused, setFocused] = useState(Math.floor(center));
  const [width, setWidth] = useState(900);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<{ i: number; from: PinFrom } | null>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const intent = useRef<number | undefined>(undefined);
  const reduce = reducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    clearTimeout(intent.current);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const press = () => {
    if (phase !== 'deck') return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFocused(Math.floor(center));
    setPhase('fan');
    later(() => setPhase('bundle'), FAN_MS);
    later(() => setPhase('deal'), FAN_MS * 2);
    later(() => setPhase('hand'), FAN_MS * 2 + ((n - 1) * DEAL_STAGGER + 0.8) * 1000);
  };

  const redeal = () => {
    timers.current.forEach(clearTimeout);
    setHovered(null);
    setPhase('deck');
  };

  const step = (d: number) => {
    if (phase === 'hand' && !pinned) setFocused((f) => Math.max(0, Math.min(n - 1, f + d)));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  };

  // Hand geometry: horizontal spacing shrinks to fit the stage; arc is gentler on phones.
  const mobile = width < 640;
  const spacing = Math.max(4, Math.min(56, (width - CARD_W - 32) / Math.max(n - 1, 1)));
  const angle = Math.min(7, 56 / Math.max(n - 1, 1)) * (mobile ? 0.5 : 1);
  const drop = mobile ? 0.6 : 1.1;

  const handTarget = (i: number) => {
    const o = i - center;
    const base =
      i === focused
        ? { x: o * spacing, y: -28, rotate: 0, scale: 1.05, zIndex: 100 }
        : { x: o * spacing, y: o * o * drop, rotate: o * angle, scale: 0.97, zIndex: i + 1 };
    const rest = { ...base, w: CARD_W, h: CARD_H, opacity: 1 };
    if (pinned || hovered === null) return pinned?.i === i ? { ...rest, opacity: 0 } : rest;
    if (i === hovered) {
      // reduced motion: no scale/rotation/growth, just the content crossfade
      return reduce
        ? { ...rest, zIndex: 200 }
        : {
            x: o * spacing,
            y: -PEEK.LIFT_PX,
            rotate: 0,
            scale: PEEK.SCALE,
            zIndex: 200,
            w: PEEK.PEEK_WIDTH_PX,
            h: PEEK.PEEK_HEIGHT_PX,
            opacity: 1,
          };
    }
    const d = i - hovered;
    const shift = reduce ? 0 : (Math.sign(d) * PEEK.NEIGHBOR_SHIFT_PX) / Math.abs(d);
    return { ...rest, x: base.x + shift, opacity: PEEK.DIM_OPACITY };
  };

  const target = (i: number) => {
    const o = i - center;
    switch (phase) {
      case 'fan':
        return {
          x: o * spacing * 0.7,
          y: o * o * drop * 0.7,
          rotate: o * angle * 0.9,
          scale: 0.97,
          zIndex: i + 1,
          w: CARD_W,
          h: CARD_H,
          opacity: 1,
        };
      case 'deal':
      case 'hand':
        return handTarget(i);
      default: // deck, bundle
        return { x: 0, y: 0, rotate: 0, scale: 0.97, zIndex: i + 1, w: CARD_W, h: CARD_H, opacity: 1 };
    }
  };

  const transition = (i: number) => {
    switch (phase) {
      case 'deck':
        return { duration: 0.55, ease: EASE, delay: (n - 1 - i) * 0.025 };
      case 'fan':
        return { duration: FAN_MS / 1000, ease: 'easeOut' as const };
      case 'bundle':
        return { duration: FAN_MS / 1000, ease: 'easeIn' as const };
      case 'deal':
        return { duration: 0.7, ease: EASE, delay: i * DEAL_STAGGER };
      default:
        return { duration: PEEK.RESET_MS / 1000, ease: EASE };
    }
  };

  // Card back: on while stacked; during the flourish the cards under the top one show faces.
  const backOpacity = (i: number) =>
    phase === 'deck' || phase === 'bundle' ? 1 : phase === 'fan' ? (i === n - 1 ? 1 : 0) : 0;
  const backTransition = (i: number) =>
    phase === 'deal'
      ? { duration: 0.15, delay: i * DEAL_STAGGER + 0.05 }
      : phase === 'deck'
        ? { duration: 0.15, delay: 0.4 }
        : { duration: 0.15, delay: phase === 'bundle' ? 0.1 : 0 };

  const pin = (i: number) => {
    const el = cardEls.current[i];
    if (!el || phase !== 'hand' || pinned) return;
    clearTimeout(intent.current);
    const r = el.getBoundingClientRect();
    const t = handTarget(i);
    setPinned({
      i,
      from: { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: el.offsetWidth * t.scale, rotate: t.rotate },
    });
    setHovered(null);
  };

  const enter = (i: number, e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || pinned) return; // touch: tap pins directly
    clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setHovered(i), PEEK.HOVER_DELAY_MS);
  };
  const leave = (i: number) => {
    clearTimeout(intent.current);
    setHovered((h) => (h === i ? null : h));
  };

  const showEdges = phase === 'deck' || phase === 'bundle';
  const inHand = phase === 'hand';

  return (
    <div className="project-carousel poker-table">
      <div className="poker-table__felt" aria-hidden />
      <div className="poker-table__rail" aria-hidden />

      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="project-carousel__viewport hand"
      >
        {/* stacked edges of the deck */}
        {[4, 3, 2, 1].map((k) => (
          <motion.div
            key={k}
            className="hand__edge"
            initial={false}
            animate={{ opacity: showEdges ? 1 : 0, x: k * 2, y: k * 2 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />
        ))}

        {projects.map((project, i) => {
          const isFocused = focused === i;
          const pip = pipFor(i);
          const cardId = `0-${project.id}`;
          const t = target(i);

          return (
            <motion.div
              key={cardId}
              ref={(el) => {
                cardEls.current[i] = el;
              }}
              initial={false}
              animate={{
                x: t.x,
                y: t.y,
                rotate: t.rotate,
                scale: t.scale,
                width: t.w,
                height: t.h,
                marginLeft: -t.w / 2,
                opacity: t.opacity,
              }}
              transition={transition(i)}
              className={cn('hand__card', isFocused && inHand && 'is-focused')}
              style={{
                zIndex: t.zIndex,
                pointerEvents: inHand ? 'auto' : 'none',
                willChange: 'transform',
              }}
              onPointerEnter={(e) => enter(i, e)}
              onPointerLeave={() => leave(i)}
            >
              {!isFocused && inHand ? (
                <div className="pointer-events-none absolute inset-0 z-10 rounded-[1.1rem] bg-black/10" aria-hidden />
              ) : null}
              <motion.div
                className="hand__back"
                initial={false}
                animate={{ opacity: backOpacity(i) }}
                transition={backTransition(i)}
                aria-hidden
              />
              {isLiveProject(project.link) && (
                <div className="project-live-badge" aria-label="Live project">
                  <span className="project-live-badge__dot" aria-hidden />
                  Live
                </div>
              )}
              <div className={cn('poker-pip poker-pip--tl', pip.red && 'poker-pip--red')} aria-hidden>
                <span>{pip.rank}</span>
                <span>{pip.glyph}</span>
              </div>
              <div className={cn('poker-pip poker-pip--br', pip.red && 'poker-pip--red')} aria-hidden>
                <span>{pip.rank}</span>
                <span>{pip.glyph}</span>
              </div>
              <div
                role="button"
                tabIndex={inHand && !pinned ? 0 : -1}
                aria-haspopup="dialog"
                aria-label={project.title}
                className={cn(
                  'expandable-card project-carousel-card poker-card hand-face',
                  hovered === i && 'is-peek',
                )}
                style={{ '--accent-color': project.color } as React.CSSProperties}
                onClick={() => pin(i)}
                onFocus={(e) => {
                  // keyboard focus shows the peek; mouse/tap focus doesn't
                  if (!pinned && e.currentTarget.matches(':focus-visible')) setHovered(i);
                }}
                onBlur={() => leave(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pin(i);
                  } else if (e.key === 'Escape') {
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
              >
                {project.image ? (
                  <div className="expandable-card__hero expandable-card__hero--collapsed shrink-0 overflow-hidden">
                    <img src={project.image} alt="" className="expandable-card__hero-img" loading="lazy" decoding="async" />
                    <div className="expandable-card__hero-accent" style={{ backgroundColor: project.color ?? '#E8856A' }} />
                  </div>
                ) : null}
                <div className="expandable-card__body flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
                  <h3 className="project-carousel-card__title">{project.title}</h3>
                  <p className="project-carousel-card__description">{project.description}</p>
                  {hovered === i ? (
                    <motion.div
                      className="hand-face__peek"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: PEEK.RESET_MS / 1000 }}
                    >
                      {project.highlights && project.highlights.length > 0 ? (
                        <ul className="hand-face__bullets">
                          {project.highlights.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="hand-face__tags">
                        {project.tech.map((tag) => (
                          <ExpandableTag key={tag} label={tag} accentColor={project.color} />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="project-carousel-card__collapsed-content">
                      <div className="project-carousel-card__footer flex flex-col gap-2.5">
                        <div className="project-carousel-card__tags flex flex-wrap gap-1.5">
                          {project.tech.slice(0, 3).map((tag) => (
                            <ExpandableTag key={tag} label={tag} accentColor={project.color} />
                          ))}
                        </div>
                        {project.highlights?.[0] ? (
                          <p className="project-carousel-card__teaser line-clamp-2">{project.highlights[0]}</p>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <span
                    className="pointer-events-none absolute bottom-4 right-4 z-[1] rounded-full p-1 text-[var(--text-secondary)]"
                    aria-hidden
                  >
                    <Plus size={18} />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {phase === 'deck' && (
          <>
            <button
              type="button"
              className="hand__deck-btn"
              onPointerDown={press}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  press();
                }
              }}
              aria-label="Deal the cards"
            />
            <motion.p
              className="hand__hint"
              animate={{ opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              press to deal
            </motion.p>
          </>
        )}
      </div>

      <div className={cn('project-carousel__controls', !inHand && 'opacity-0 pointer-events-none')}>
        <button type="button" onClick={redeal} className="poker-nav" aria-label="Re-shuffle">
          <RotateCcw size={16} />
        </button>
        <button type="button" onClick={() => step(-1)} className="poker-nav" aria-label="Previous project">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => step(1)} className="poker-nav" aria-label="Next project">
          <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence>
        {pinned && (
          <PinnedCard
            key={pinned.i}
            project={projects[pinned.i]}
            from={pinned.from}
            onClosed={() => setPinned(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
