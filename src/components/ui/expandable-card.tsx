import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { cn } from '@/lib/utils';

type ExpandableCardId = string | number;

interface ExpandableCardGroupContextValue {
  activeId: ExpandableCardId | null;
  setActiveId: (id: ExpandableCardId | null) => void;
}

const ExpandableCardGroupContext =
  createContext<ExpandableCardGroupContextValue | null>(null);

function useExpandableCardGroup() {
  const context = useContext(ExpandableCardGroupContext);
  if (!context) {
    throw new Error('ExpandableCard must be used within ExpandableCardGroup');
  }
  return context;
}

export function ExpandableCardGroup({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<ExpandableCardId | null>(null);

  useEffect(() => {
    if (activeId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeId]);

  return (
    <ExpandableCardGroupContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </ExpandableCardGroupContext.Provider>
  );
}

export function ExpandableTag({
  label,
}: {
  label: string;
  accentColor?: string;
}) {
  return (
    <span
      className="tech-badge inline-flex h-6 items-center rounded-[6px] px-2.5 text-[0.75rem] font-medium leading-none transition-all"
      style={{
        background: 'var(--tag-bg)',
        color: 'var(--tag-text)',
        border: '1px solid var(--tag-border)',
      }}
    >
      {label}
    </span>
  );
}

function AccentAnchor({
  id,
  accentColor,
  expanded,
  sharedLayout = true,
}: {
  id: ExpandableCardId;
  accentColor: string;
  expanded: boolean;
  sharedLayout?: boolean;
}) {
  return (
    <motion.div
      layoutId={sharedLayout ? `accent-${id}` : undefined}
      className={cn('w-full shrink-0', expanded ? 'mb-4 h-20 rounded-xl' : 'mb-2 h-1 rounded-full')}
      style={{
        background: expanded
          ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`
          : accentColor,
        opacity: expanded ? 0.15 : 0,
      }}
    />
  );
}

function CardHero({
  layoutId,
  image,
  accentColor,
  expanded,
  isExperienceBanner = false,
}: {
  layoutId?: string;
  image?: string;
  accentColor: string;
  expanded: boolean;
  isExperienceBanner?: boolean;
}) {
  // No screenshot = no image area; the card just starts with its text.
  if (!image) return null;
  return (
    <motion.div
      layoutId={layoutId}
      className={cn(
        'expandable-card__hero shrink-0 overflow-hidden',
        expanded ? 'expandable-card__hero--expanded' : 'expandable-card__hero--collapsed',
        isExperienceBanner && 'expandable-card__hero--experience-banner',
      )}
    >
      <img
        src={image}
        alt=""
        className="expandable-card__hero-img"
        loading="lazy"
        decoding="async"
      />
      <div
        className="expandable-card__hero-accent"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  );
}

const EXPAND_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface ExpandableCardProps {
  id: ExpandableCardId;
  title: string;
  description: string;
  accentColor?: string;
  image?: string;
  link?: string;
  collapsedContent?: ReactNode;
  children?: ReactNode;
  className?: string;
  collapsedClassName?: string;
  collapsedTitleClassName?: string;
  collapsedDescriptionClassName?: string;
  collapsedTitleAdornment?: ReactNode;
  collapsedContentClassName?: string;
  pinCollapsedContent?: boolean;
  accentGradient?: boolean;
  showExpandAffordance?: boolean;
  heroStyle?: 'accent-bar' | 'project-hero' | 'card-hero' | 'experience-banner';
  whileHover?: HTMLMotionProps<'button'>['whileHover'];
  onCollapsedClick?: (
    event: MouseEvent<HTMLButtonElement>,
    expand: () => void,
  ) => void;
}

export function ExpandableCard({
  id,
  title,
  description,
  accentColor = '#E8856A',
  image,
  link,
  collapsedContent,
  children,
  className,
  collapsedClassName,
  collapsedTitleClassName,
  collapsedDescriptionClassName,
  collapsedTitleAdornment,
  collapsedContentClassName,
  pinCollapsedContent = false,
  accentGradient = false,
  showExpandAffordance = false,
  heroStyle = 'accent-bar',
  whileHover,
  onCollapsedClick,
}: ExpandableCardProps) {
  const { activeId, setActiveId } = useExpandableCardGroup();
  const isActive = activeId === id;
  const modalRef = useRef<HTMLDivElement>(null);

  const onClose = () => setActiveId(null);

  useOutsideClick(modalRef, () => {
    if (isActive) {
      onClose();
    }
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive]);

  const useCardHero =
    heroStyle === 'project-hero' ||
    heroStyle === 'card-hero' ||
    heroStyle === 'experience-banner';
  const useProjectHero = heroStyle === 'project-hero';
  const isExperienceBanner = heroStyle === 'experience-banner';
  // Shared layout morphs through rotated/scaled hand cards are janky — use a
  // lightweight scale/fade expand for project cards instead.
  const sharedLayout = !useProjectHero;
  const cardLayoutId = sharedLayout ? `card-${id}` : undefined;
  const titleLayoutId = sharedLayout ? `title-${id}` : undefined;
  const descLayoutId = sharedLayout ? `desc-${id}` : undefined;
  const imageLayoutId = sharedLayout ? `image-${id}` : undefined;

  const collapsedBackgroundStyle =
    accentGradient && !useCardHero
      ? {
          backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 8%, var(--bg)) 0%, var(--bg) 45%)`,
        }
      : undefined;

  const collapsedHero = useCardHero ? (
    <CardHero
      layoutId={imageLayoutId}
      image={image}
      accentColor={accentColor}
      expanded={false}
      isExperienceBanner={isExperienceBanner}
    />
  ) : image ? (
    <motion.div layoutId={imageLayoutId} className="mb-4">
      <img
        src={image}
        alt=""
        className="h-24 w-full rounded-lg border border-[var(--card-border)] object-cover"
      />
    </motion.div>
  ) : (
    <AccentAnchor id={id} accentColor={accentColor} expanded={false} sharedLayout={sharedLayout} />
  );

  const expandedHero = useCardHero ? (
    <CardHero
      layoutId={imageLayoutId}
      image={image}
      accentColor={accentColor}
      expanded
      isExperienceBanner={isExperienceBanner}
    />
  ) : image ? (
    <motion.div layoutId={imageLayoutId} className="mb-4 pr-8">
      <img
        src={image}
        alt=""
        className="h-40 w-full rounded-xl border border-[var(--card-border)] object-cover"
      />
    </motion.div>
  ) : (
    <AccentAnchor id={id} accentColor={accentColor} expanded sharedLayout={sharedLayout} />
  );

  return (
    <>
      <motion.button
        type="button"
        layoutId={cardLayoutId}
        onClick={(event) => {
          if (onCollapsedClick) {
            onCollapsedClick(event, () => setActiveId(id));
            return;
          }
          setActiveId(id);
        }}
        whileHover={whileHover}
        transition={
          sharedLayout
            ? { type: 'spring', stiffness: 280, damping: 28 }
            : { duration: 0.2, ease: EXPAND_EASE }
        }
        style={{
          ...collapsedBackgroundStyle,
          '--accent-color': accentColor,
        } as React.CSSProperties}
        className={cn(
          'expandable-card relative flex cursor-pointer flex-col text-left',
          'rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8856A]',
          useCardHero && 'overflow-hidden p-0',
          isActive && useProjectHero && 'opacity-0 pointer-events-none',
          collapsedClassName,
          className,
        )}
      >
        {collapsedHero}
        <div
          className={cn(
            'expandable-card__body flex min-h-0 flex-1 flex-col',
            useCardHero ? 'px-5 pb-5 pt-4' : '',
          )}
        >
          {collapsedTitleAdornment ? (
            <div className="flex min-w-0 items-start gap-2.5">
              {collapsedTitleAdornment}
              <div className="min-w-0 flex-1">
                <motion.h3
                  layoutId={titleLayoutId}
                  className={cn(
                    !collapsedTitleClassName &&
                      'text-lg font-bold leading-tight text-[var(--text-primary)]',
                    collapsedTitleClassName,
                  )}
                >
                  {title}
                </motion.h3>
                <motion.p
                  layoutId={descLayoutId}
                  className={cn(
                    !collapsedDescriptionClassName &&
                      'mt-2 line-clamp-2 text-sm leading-snug text-[var(--text-secondary)]',
                    collapsedDescriptionClassName,
                  )}
                >
                  {description}
                </motion.p>
              </div>
            </div>
          ) : (
            <>
              <motion.h3
                layoutId={titleLayoutId}
                className={cn(
                  !collapsedTitleClassName &&
                    'text-lg font-bold leading-tight text-[var(--text-primary)]',
                  collapsedTitleClassName,
                )}
              >
                {title}
              </motion.h3>
              <motion.p
                layoutId={descLayoutId}
                className={cn(
                  !collapsedDescriptionClassName &&
                    'mt-2 line-clamp-2 text-sm leading-snug text-[var(--text-secondary)]',
                  collapsedDescriptionClassName,
                )}
              >
                {description}
              </motion.p>
            </>
          )}
          {collapsedContent ? (
            <div
              className={cn(
                pinCollapsedContent ? 'mt-auto pt-3' : 'pt-0',
                collapsedContentClassName,
              )}
            >
              {collapsedContent}
            </div>
          ) : null}
          {showExpandAffordance ? (
            <span
              className="pointer-events-none absolute bottom-4 right-4 z-[1] rounded-full p-1 text-[var(--text-secondary)]"
              aria-hidden
            >
              <Plus size={18} />
            </span>
          ) : null}
        </div>
      </motion.button>

      {/* Portaled: transformed ancestors (e.g. the dealt hand) would break position:fixed. */}
      {createPortal(
      <AnimatePresence>
        {isActive ? (
          <motion.div
            key={`modal-backdrop-${id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4',
              !useProjectHero && 'backdrop-blur-sm',
            )}
            onClick={onClose}
          >
            <motion.div
              ref={modalRef}
              layoutId={cardLayoutId}
              initial={
                useProjectHero
                  ? { opacity: 0, scale: 0.94, y: 18 }
                  : undefined
              }
              animate={
                useProjectHero
                  ? { opacity: 1, scale: 1, y: 0 }
                  : undefined
              }
              exit={
                useProjectHero
                  ? { opacity: 0, scale: 0.96, y: 10 }
                  : undefined
              }
              transition={
                useProjectHero
                  ? { duration: 0.32, ease: EXPAND_EASE }
                  : { type: 'spring', stiffness: 280, damping: 28 }
              }
              onClick={(event) => event.stopPropagation()}
              className={cn(
                'expandable-card__modal relative flex w-full flex-col',
                'overflow-x-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-0 shadow-lg',
                useProjectHero
                  ? 'expandable-card__modal--project'
                  : 'max-h-[min(90vh,40rem)] max-w-lg overflow-y-auto',
              )}
              style={useProjectHero ? { willChange: 'transform, opacity' } : undefined}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--card-border)] hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div
                className={cn(
                  'expandable-card__modal-hero',
                  useProjectHero && 'expandable-card__modal-hero--project',
                )}
              >
                {expandedHero}
              </div>

              <div
                className={cn(
                  'expandable-card__modal-content',
                  useProjectHero && 'expandable-card__modal-content--project',
                )}
              >
                <motion.h3
                  layoutId={titleLayoutId}
                  className="expandable-card__modal-title pr-10"
                >
                  {title}
                </motion.h3>
                <motion.p
                  layoutId={descLayoutId}
                  className="expandable-card__modal-desc"
                >
                  {description}
                </motion.p>

                {children ? (
                  <div className="expandable-card__modal-body">{children}</div>
                ) : null}

                {link ? (
                  <a
                    href={link}
                    className="expandable-card__modal-link inline-flex items-center gap-1 font-medium text-[var(--accent-forest)] transition-all hover:translate-x-1 hover:text-[var(--text-primary)]"
                    {...(link !== '#'
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    onClick={(event) => {
                      if (link === '#') {
                        event.preventDefault();
                      }
                    }}
                  >
                    View project →
                  </a>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
      )}
    </>
  );
}
