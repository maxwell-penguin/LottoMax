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

const isLiveProject = (link?: string) =>
  !!link && link !== '#' && !link.includes('github.com');

export function ProjectCarousel({ projects }: { projects: ProjectCarouselItem[] }) {
  const n = projects.length;

  // Triple the list so we can loop in both directions.
  // Layout: [first_copy 0..n-1] [middle_copy n..2n-1] [last_copy 2n..3n-1]
  // We always start and return to the middle copy.
  const displayItems = [...projects, ...projects, ...projects];

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const isTeleporting = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  // Keep focusedIndex in both state (triggers re-render) and a ref (always current
  // in async callbacks without stale-closure issues).
  const [focusedIndex, _setFocusedIndex] = useState(n);
  const focusedIndexRef = useRef(n);
  const setFocusedIndex = useCallback((idx: number) => {
    focusedIndexRef.current = idx;
    _setFocusedIndex(idx);
  }, []);

  const [edgeInset, setEdgeInset] = useState(16);

  // ── focus tracking ────────────────────────────────────────────────────────

  const updateFocusedCard = useCallback(() => {
    if (isTeleporting.current) return;
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
  }, [setFocusedIndex]);

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

  // ── scrolling ─────────────────────────────────────────────────────────────

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = carouselRef.current;
    const card = cardRefs.current[index];
    if (!container || !card) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta =
      cardRect.left + cardRect.width / 2 - (containerRect.left + containerRect.width / 2);

    if (smooth) {
      container.scrollTo({ left: container.scrollLeft + delta, behavior: 'smooth' });
    } else {
      // Direct assignment is universally instant (no animation) across all browsers.
      container.scrollLeft += delta;
    }
  }, []);

  // ── infinite teleport ─────────────────────────────────────────────────────

  // After the user scrolls into an outer copy, jump the scroll position to the
  // visually identical position in the middle copy. The delta between equivalent
  // cards is constant (width of one full copy), so the viewport looks unchanged.
  const performTeleport = useCallback(
    (fromIndex: number) => {
      const container = carouselRef.current;
      const fromCard = cardRefs.current[fromIndex];
      if (!container || !fromCard) return;

      // Mirror inside the middle copy.
      const targetIndex = fromIndex < n ? fromIndex + n : fromIndex - n;
      const targetCard = cardRefs.current[targetIndex];
      if (!targetCard) return;

      // scrollDelta = how far the target card is from the from-card in viewport space.
      // Adding this to scrollLeft repositions the viewport without any visible jump.
      const scrollDelta =
        targetCard.getBoundingClientRect().left - fromCard.getBoundingClientRect().left;

      isTeleporting.current = true;
      container.scrollLeft += scrollDelta;
      setFocusedIndex(targetIndex);

      requestAnimationFrame(() => {
        isTeleporting.current = false;
      });
    },
    [n, setFocusedIndex],
  );

  // Schedule a teleport check 150 ms after the last scroll event — enough time
  // for CSS snap to settle before we read card positions.
  const scheduleScrollEndTeleport = useCallback(() => {
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      const idx = focusedIndexRef.current;
      if (idx < n || idx >= 2 * n) {
        performTeleport(idx);
      }
    }, 150);
  }, [n, performTeleport]);

  // ── mount / resize ────────────────────────────────────────────────────────

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, displayItems.length);

    const frame = requestAnimationFrame(() => {
      updateLayout();
      if (!isInitialized.current) {
        isInitialized.current = true;
        // Jump instantly to the middle copy so we can loop in both directions.
        scrollToIndex(n, false);
        setFocusedIndex(n);
      }
    });

    const container = carouselRef.current;
    if (!container) return () => cancelAnimationFrame(frame);

    const handleScroll = () => {
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
    displayItems.length,
    n,
    scheduleFocusUpdate,
    scheduleScrollEndTeleport,
    scrollToIndex,
    setFocusedIndex,
    updateLayout,
  ]);

  // ── controls ──────────────────────────────────────────────────────────────

  const scroll = (direction: 'left' | 'right') => {
    // Read from ref so rapid button presses don't use stale state.
    const current = focusedIndexRef.current;
    const next = direction === 'left' ? current - 1 : current + 1;
    // Clamp to the physical bounds of the 3× list; the teleport wraps the logical index.
    const safe = Math.max(0, Math.min(3 * n - 1, next));
    scrollToIndex(safe);
  };

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') scroll('left');
    if (event.key === 'ArrowRight') scroll('right');
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="project-carousel">
      <div
        ref={carouselRef}
        tabIndex={0}
        onKeyDown={onCarouselKeyDown}
        className="project-carousel__viewport"
      >
        <div className="project-carousel__track">
          <div
            className="project-carousel__spacer"
            style={{ width: edgeInset }}
            aria-hidden
          />
          {displayItems.map((project, index) => {
            const previewTags = project.tech.slice(0, 4);
            const isFocused = focusedIndex === index;
            // Each copy gets a unique id to avoid Framer Motion layoutId collisions.
            const copyIndex = Math.floor(index / n);
            const cardId = `${copyIndex}-${project.id}`;

            return (
              <motion.div
                key={cardId}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                animate={{
                  scale: isFocused ? 1 : 0.92,
                  opacity: isFocused ? 1 : 0.5,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn('project-carousel__card', isFocused && 'is-focused')}
              >
                {!isFocused ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-black/10"
                    aria-hidden
                  />
                ) : null}
                {isLiveProject(project.link) && (
                  <div className="project-live-badge" aria-label="Live project">
                    <span className="project-live-badge__dot" aria-hidden />
                    Live
                  </div>
                )}
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
                  collapsedClassName="project-carousel-card h-[26rem] w-[18.75rem] shrink-0"
                  collapsedContentClassName="project-carousel-card__collapsed-content"
                  onCollapsedClick={(_, expand) => {
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
          <div
            className="project-carousel__spacer"
            style={{ width: edgeInset }}
            aria-hidden
          />
        </div>
      </div>

      <div className="project-carousel__controls">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] hover:translate-x-[-2px]"
          aria-label="Previous project"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] hover:translate-x-[2px]"
          aria-label="Next project"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
