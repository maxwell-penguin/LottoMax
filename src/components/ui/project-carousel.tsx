import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

type DealPhase = 'stacked' | 'spread' | 'hold' | 'gather' | 'ready';

const EASE_DEAL: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_GATHER: [number, number, number, number] = [0.33, 1, 0.32, 1];

function dealTransition(phase: DealPhase, logical: number, n: number) {
  const center = Math.floor((n - 1) / 2);
  const fromCenter = Math.abs(logical - center);
  // Deal outward from the middle of the hand.
  const stagger = fromCenter * 0.055;

  if (phase === 'spread') {
    return {
      x: { duration: 1.05, ease: EASE_DEAL, delay: 0.08 + stagger },
      y: { duration: 1.15, ease: EASE_DEAL, delay: 0.08 + stagger },
      rotate: { duration: 1.1, ease: EASE_DEAL, delay: 0.08 + stagger },
      scale: { duration: 0.9, ease: EASE_DEAL, delay: 0.08 + stagger },
      opacity: { duration: 0.45, ease: 'easeOut', delay: stagger * 0.5 },
    };
  }
  if (phase === 'hold') {
    return { duration: 0.35, ease: 'easeOut' };
  }
  if (phase === 'gather') {
    // Outer cards tuck in first, center last — like closing a fan.
    const tuck = (n - 1 - fromCenter) * 0.04;
    return {
      x: { duration: 0.95, ease: EASE_GATHER, delay: tuck },
      y: { duration: 1.0, ease: EASE_GATHER, delay: tuck },
      rotate: { duration: 0.9, ease: EASE_GATHER, delay: tuck },
      scale: { duration: 0.85, ease: EASE_GATHER, delay: tuck },
      opacity: { duration: 0.55, ease: 'easeOut', delay: tuck + 0.15 },
    };
  }
  return { duration: 0.35, ease: EASE_DEAL };
}

export function ProjectCarousel({ projects }: { projects: ProjectCarouselItem[] }) {
  const n = projects.length;
  const displayItems = [...projects, ...projects, ...projects];

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const isTeleporting = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  const [focusedIndex, _setFocusedIndex] = useState(n);
  const focusedIndexRef = useRef(n);
  const setFocusedIndex = useCallback((idx: number) => {
    focusedIndexRef.current = idx;
    _setFocusedIndex(idx);
  }, []);

  const [edgeInset, setEdgeInset] = useState(16);
  const [phase, setPhase] = useState<DealPhase>('stacked');
  const dealing = phase !== 'ready';
  const fanning = phase === 'stacked' || phase === 'spread' || phase === 'hold';

  const updateFocusedCard = useCallback(() => {
    if (isTeleporting.current || dealing) return;
    const container = carouselRef.current;
    if (!container) return;

    const containerCenter =
      container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setFocusedIndex(closestIndex);
  }, [dealing, setFocusedIndex]);

  const updateLayout = useCallback(() => {
    const container = carouselRef.current;
    const firstCard = cardRefs.current[0];
    if (!container) return;

    const cardWidth = firstCard?.offsetWidth ?? 300;
    setEdgeInset(Math.max(16, (container.clientWidth - cardWidth) / 2));
    updateFocusedCard();
  }, [updateFocusedCard]);

  const scheduleFocusUpdate = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateLayout();
    });
  }, [updateLayout]);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = carouselRef.current;
    const card = cardRefs.current[index];
    if (!container || !card) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta =
      cardRect.left + cardRect.width / 2 - (containerRect.left + containerRect.width / 2);

    container.scrollTo({
      left: container.scrollLeft + delta,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  const performTeleport = useCallback(
    (fromIndex: number) => {
      const container = carouselRef.current;
      const fromCard = cardRefs.current[fromIndex];
      if (!container || !fromCard) return;

      const targetIndex = fromIndex < n ? fromIndex + n : fromIndex - n;
      const targetCard = cardRefs.current[targetIndex];
      if (!targetCard) return;

      const scrollDelta =
        targetCard.getBoundingClientRect().left - fromCard.getBoundingClientRect().left;

      isTeleporting.current = true;
      container.scrollTo({ left: container.scrollLeft + scrollDelta, behavior: 'instant' });
      setFocusedIndex(targetIndex);

      requestAnimationFrame(() => {
        isTeleporting.current = false;
      });
    },
    [n, setFocusedIndex],
  );

  const scheduleScrollEndTeleport = useCallback(() => {
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      const idx = focusedIndexRef.current;
      if (idx < n || idx >= 2 * n) {
        performTeleport(idx);
      }
    }, 150);
  }, [n, performTeleport]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, displayItems.length);

    const frame = requestAnimationFrame(() => {
      updateLayout();
      if (!isInitialized.current) {
        isInitialized.current = true;
        scrollToIndex(n, false);
        setFocusedIndex(n);
      }
    });

    const container = carouselRef.current;
    if (!container) return () => cancelAnimationFrame(frame);

    const handleScroll = () => {
      if (dealing) return;
      scheduleFocusUpdate();
      scheduleScrollEndTeleport();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', scheduleFocusUpdate);

    return () => {
      cancelAnimationFrame(frame);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', scheduleFocusUpdate);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [
    dealing,
    displayItems.length,
    n,
    scheduleFocusUpdate,
    scheduleScrollEndTeleport,
    scrollToIndex,
    setFocusedIndex,
    updateLayout,
  ]);

  // Casino deal: stack → fan → hold → gather → ready
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase('ready');
      return undefined;
    }

    setPhase('stacked');
    const tFan = window.setTimeout(() => setPhase('spread'), 120);
    const tHold = window.setTimeout(() => setPhase('hold'), 1500);
    const tGather = window.setTimeout(() => setPhase('gather'), 2100);
    const tReady = window.setTimeout(() => {
      setPhase('ready');
      scrollToIndex(n, false);
      setFocusedIndex(n);
    }, 3200);

    return () => {
      window.clearTimeout(tFan);
      window.clearTimeout(tHold);
      window.clearTimeout(tGather);
      window.clearTimeout(tReady);
    };
  }, [n, scrollToIndex, setFocusedIndex]);

  const scroll = (direction: 'left' | 'right') => {
    if (dealing) return;
    const current = focusedIndexRef.current;
    const next = direction === 'left' ? current - 1 : current + 1;
    const safe = Math.max(0, Math.min(3 * n - 1, next));
    scrollToIndex(safe);
  };

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') scroll('left');
    if (event.key === 'ArrowRight') scroll('right');
  };

  const dealMotion = (index: number, isFocused: boolean) => {
    const copyIndex = Math.floor(index / n);
    const logical = index % n;
    // Fan only the middle copy; outer copies stay hidden until ready.
    if (copyIndex !== 1 && phase !== 'ready') {
      return { x: 0, y: 0, rotate: 0, scale: 0.92, opacity: 0, zIndex: 0 };
    }

    const centerLogical = Math.floor((n - 1) / 2);
    const offset = logical - centerLogical;
    const abs = Math.abs(offset);
    // Arc fan: angle fans from center; y dips into an ellipse like a real hand.
    const maxAngle = Math.min(11, 72 / Math.max(n - 1, 1));
    const fanRotate = offset * maxAngle;
    const fanX = offset * (48 + Math.min(18, 140 / Math.max(n, 1)));
    const fanY = 6 + abs * abs * 2.2;

    if (phase === 'stacked') {
      return {
        x: offset * 1.2,
        y: abs * 0.35,
        rotate: offset * 0.35,
        scale: 0.94,
        opacity: 1,
        zIndex: 20 + (n - abs),
      };
    }
    if (phase === 'spread' || phase === 'hold') {
      return {
        x: fanX,
        y: fanY,
        rotate: fanRotate,
        scale: 1.02 - abs * 0.012,
        opacity: 1,
        zIndex: 20 + (n - abs),
      };
    }
    if (phase === 'gather') {
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: isFocused ? 1 : 0.92,
        opacity: copyIndex === 1 ? (isFocused ? 1 : 0.55) : 0,
        zIndex: isFocused ? 5 : 1,
      };
    }
    return {
      x: 0,
      y: 0,
      rotate: 0,
      scale: isFocused ? 1 : 0.92,
      opacity: isFocused ? 1 : 0.52,
      zIndex: isFocused ? 5 : 1,
    };
  };

  return (
    <div className={cn('project-carousel poker-table', fanning && 'poker-table--dealing')}>
      <div className="poker-table__felt" aria-hidden />
      <div className="poker-table__rail" aria-hidden />

      <div
        ref={carouselRef}
        tabIndex={0}
        onKeyDown={onCarouselKeyDown}
        className="project-carousel__viewport"
        style={{ overflowX: dealing ? 'hidden' : undefined }}
      >
        <div className="project-carousel__track">
          <div className="project-carousel__spacer" style={{ width: edgeInset }} aria-hidden />
          {displayItems.map((project, index) => {
            const previewTags = project.tech.slice(0, 3);
            const isFocused = focusedIndex === index;
            const copyIndex = Math.floor(index / n);
            const logicalIndex = index % n;
            const cardId = `${copyIndex}-${project.id}`;
            const pip = pipFor(logicalIndex);
            const motionState = dealMotion(index, isFocused);

            return (
              <motion.div
                key={cardId}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                initial={false}
                animate={motionState}
                transition={dealTransition(phase, logicalIndex, n)}
                className={cn(
                  'project-carousel__card poker-card-wrap',
                  isFocused && 'is-focused',
                  dealing && 'poker-card-wrap--dealing',
                )}
                style={{
                  zIndex: motionState.zIndex,
                  transformOrigin: '50% 100%',
                }}
              >
                {!isFocused && phase === 'ready' ? (
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-[1.1rem] bg-black/10" aria-hidden />
                ) : null}
                {isLiveProject(project.link) && (
                  <div className="project-live-badge" aria-label="Live project">
                    <span className="project-live-badge__dot" aria-hidden />
                    Live
                  </div>
                )}
                <div
                  className={cn('poker-pip poker-pip--tl', pip.red && 'poker-pip--red')}
                  aria-hidden
                >
                  <span>{pip.rank}</span>
                  <span>{pip.glyph}</span>
                </div>
                <div
                  className={cn('poker-pip poker-pip--br', pip.red && 'poker-pip--red')}
                  aria-hidden
                >
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
                    if (dealing) return;
                    if (isFocused) {
                      expand();
                    } else {
                      scrollToIndex(index);
                    }
                  }}
                  collapsedContent={
                    <div className="project-carousel-card__footer flex flex-col gap-2.5">
                      <div className="project-carousel-card__tags flex flex-wrap gap-1.5">
                        {previewTags.map((tag) => (
                          <ExpandableTag
                            key={tag}
                            label={tag}
                            accentColor={project.color}
                          />
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
                      <ExpandableTag
                        key={tag}
                        label={tag}
                        accentColor={project.color}
                      />
                    ))}
                  </div>
                </ExpandableCard>
              </motion.div>
            );
          })}
          <div className="project-carousel__spacer" style={{ width: edgeInset }} aria-hidden />
        </div>
      </div>

      <div className={cn('project-carousel__controls', dealing && 'opacity-0 pointer-events-none')}>
        <button
          type="button"
          onClick={() => scroll('left')}
          className="poker-nav"
          aria-label="Previous project"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          className="poker-nav"
          aria-label="Next project"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
