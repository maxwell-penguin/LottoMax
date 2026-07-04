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
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [edgeInset, setEdgeInset] = useState(16);

  const updateFocusedCard = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setFocusedIndex(closestIndex);
  }, []);

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

  const scrollToIndex = useCallback((index: number) => {
    const container = carouselRef.current;
    const card = cardRefs.current[index];
    if (!container || !card) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const cardCenter = cardRect.left + cardRect.width / 2;
    const scrollDelta = cardCenter - containerCenter;

    container.scrollTo({
      left: container.scrollLeft + scrollDelta,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, projects.length);

    const frame = requestAnimationFrame(() => {
      updateLayout();
    });

    const container = carouselRef.current;
    if (!container) {
      return () => cancelAnimationFrame(frame);
    }

    container.addEventListener('scroll', scheduleFocusUpdate, { passive: true });
    window.addEventListener('resize', scheduleFocusUpdate);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('scroll', scheduleFocusUpdate);
      window.removeEventListener('resize', scheduleFocusUpdate);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [projects.length, scheduleFocusUpdate, updateLayout]);

  const scroll = (direction: 'left' | 'right') => {
    const nextIndex =
      direction === 'left' ? focusedIndex - 1 : focusedIndex + 1;
    if (nextIndex >= 0 && nextIndex < projects.length) {
      scrollToIndex(nextIndex);
    }
  };

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') scroll('left');
    if (event.key === 'ArrowRight') scroll('right');
  };

  const canScrollLeft = focusedIndex > 0;
  const canScrollRight = focusedIndex < projects.length - 1;

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
          {projects.map((project, index) => {
            const previewTags = project.tech.slice(0, 4);
            const isFocused = focusedIndex === index;

            return (
              <motion.div
                key={project.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                animate={{
                  scale: isFocused ? 1 : 0.92,
                  opacity: isFocused ? 1 : 0.5,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                  'project-carousel__card',
                  isFocused && 'is-focused',
                )}
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
                  id={project.id}
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
          disabled={!canScrollLeft}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#0a0a0a] transition-all hover:translate-x-[-2px] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#0a0a0a] transition-all hover:translate-x-[2px] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
