import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableTag,
} from '@/components/ui/expandable-card';
import { cn } from '@/lib/utils';

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

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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
    setPhase('deck');
  };

  const step = (d: number) => {
    if (phase === 'hand') setFocused((f) => Math.max(0, Math.min(n - 1, f + d)));
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
    if (i === focused) {
      return { x: o * spacing, y: -28, rotate: 0, scale: 1.05, zIndex: 100 };
    }
    return { x: o * spacing, y: o * o * drop, rotate: o * angle, scale: 0.97, zIndex: i + 1 };
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
        };
      case 'deal':
      case 'hand':
        return handTarget(i);
      default: // deck, bundle
        return { x: 0, y: 0, rotate: 0, scale: 0.97, zIndex: i + 1 };
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
        return { duration: 0.35, ease: EASE };
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
              initial={false}
              animate={{ x: t.x, y: t.y, rotate: t.rotate, scale: t.scale }}
              transition={transition(i)}
              className={cn('hand__card', isFocused && inHand && 'is-focused')}
              style={{ zIndex: t.zIndex, pointerEvents: inHand ? 'auto' : 'none' }}
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
              <ExpandableCard
                id={cardId}
                title={project.title}
                description={project.description}
                accentColor={project.color}
                image={project.image}
                link={project.link}
                heroStyle="project-hero"
                accentGradient={!project.image}
                showExpandAffordance
                collapsedTitleClassName="project-carousel-card__title"
                collapsedDescriptionClassName="project-carousel-card__description"
                collapsedClassName="project-carousel-card poker-card h-[26rem] w-[17.5rem] shrink-0"
                collapsedContentClassName="project-carousel-card__collapsed-content"
                onCollapsedClick={(_, expand) => {
                  if (!inHand) return;
                  if (isFocused) expand();
                  else setFocused(i);
                }}
                collapsedContent={
                  <div className="project-carousel-card__footer flex flex-col gap-2.5">
                    <div className="project-carousel-card__tags flex flex-wrap gap-1.5">
                      {project.tech.slice(0, 3).map((tag) => (
                        <ExpandableTag key={tag} label={tag} accentColor={project.color} />
                      ))}
                    </div>
                    {project.highlights?.[0] ? (
                      <p className="project-carousel-card__teaser line-clamp-2">
                        {project.highlights[0]}
                      </p>
                    ) : null}
                  </div>
                }
              >
                {project.highlights && project.highlights.length > 0 ? (
                  <ul className="project-highlights">
                    {project.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="project-tech flex flex-wrap gap-2">
                  {project.tech.map((tag) => (
                    <ExpandableTag key={tag} label={tag} accentColor={project.color} />
                  ))}
                </div>
              </ExpandableCard>
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
    </div>
  );
}
