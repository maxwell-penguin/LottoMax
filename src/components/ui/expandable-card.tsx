import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
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
    <span className="tech-badge inline-flex h-6 items-center rounded-[6px] px-2.5 text-[0.75rem] font-medium leading-none transition-all" style={{ background: '#EEF4F7', color: '#4A7A91', border: '1px solid #DDE9EF' }}>
      {label}
    </span>
  );
}

function AccentAnchor({
  id,
  accentColor,
  expanded,
}: {
  id: ExpandableCardId;
  accentColor: string;
  expanded: boolean;
}) {
  return (
    <motion.div
      layoutId={`accent-${id}`}
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
  layoutId: string;
  image?: string;
  accentColor: string;
  expanded: boolean;
  isExperienceBanner?: boolean;
}) {
  return (
    <motion.div
      layoutId={layoutId}
      className={cn(
        'expandable-card__hero shrink-0 overflow-hidden',
        expanded ? 'expandable-card__hero--expanded' : 'expandable-card__hero--collapsed',
        isExperienceBanner && 'expandable-card__hero--experience-banner',
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="expandable-card__hero-img"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="expandable-card__hero-fallback"
          style={{
            background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
          }}
        />
      )}
      <div
        className="expandable-card__hero-accent"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  );
}

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

  const cardLayoutId = `card-${id}`;
  const titleLayoutId = `title-${id}`;
  const descLayoutId = `desc-${id}`;
  const imageLayoutId = `image-${id}`;
  const useCardHero =
    heroStyle === 'project-hero' ||
    heroStyle === 'card-hero' ||
    heroStyle === 'experience-banner';
  const useProjectHero = heroStyle === 'project-hero';
  const isExperienceBanner = heroStyle === 'experience-banner';

  const collapsedBackgroundStyle =
    accentGradient && !useCardHero
      ? {
          backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 8%, #F8F7F4) 0%, #F8F7F4 45%)`,
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
        className="h-24 w-full rounded-lg border border-[#EFEFEC] object-cover"
      />
    </motion.div>
  ) : (
    <AccentAnchor id={id} accentColor={accentColor} expanded={false} />
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
        className="h-40 w-full rounded-xl border border-[#EFEFEC] object-cover"
      />
    </motion.div>
  ) : (
    <AccentAnchor id={id} accentColor={accentColor} expanded />
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
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          ...collapsedBackgroundStyle,
          '--accent-color': accentColor,
        } as React.CSSProperties}
        className={cn(
          'expandable-card relative flex cursor-pointer flex-col text-left',
          'rounded-3xl border border-[#EFEFEC] bg-white shadow-sm',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8856A]',
          useCardHero && 'overflow-hidden p-0',
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
                      'text-lg font-bold leading-tight text-[#1A1A18]',
                    collapsedTitleClassName,
                  )}
                >
                  {title}
                </motion.h3>
                <motion.p
                  layoutId={descLayoutId}
                  className={cn(
                    !collapsedDescriptionClassName &&
                      'mt-2 line-clamp-2 text-sm leading-snug text-[#6B6B66]',
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
                    'text-lg font-bold leading-tight text-[#1A1A18]',
                  collapsedTitleClassName,
                )}
              >
                {title}
              </motion.h3>
              <motion.p
                layoutId={descLayoutId}
                className={cn(
                  !collapsedDescriptionClassName &&
                    'mt-2 line-clamp-2 text-sm leading-snug text-[#6B6B66]',
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
              className="pointer-events-none absolute bottom-4 right-4 z-[1] rounded-full p-1 text-[#6B6B66]"
              aria-hidden
            >
              <Plus size={18} />
            </span>
          ) : null}
        </div>
      </motion.button>

      <AnimatePresence>
        {isActive ? (
          <motion.div
            key={`modal-backdrop-${id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              ref={modalRef}
              layoutId={cardLayoutId}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                'expandable-card__modal relative flex w-full flex-col',
                'overflow-x-hidden rounded-3xl border border-[#EFEFEC] bg-white p-0 shadow-lg',
                useProjectHero
                  ? 'expandable-card__modal--project'
                  : 'max-h-[min(90vh,40rem)] max-w-lg overflow-y-auto',
              )}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full p-1 text-[#6B6B66] transition-colors hover:bg-[#EFEFEC] hover:text-[#1A1A18]"
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
                    className="expandable-card__modal-link inline-flex items-center gap-1 font-semibold text-[#1A1A18] transition-all hover:translate-x-1 hover:text-black"
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
      </AnimatePresence>
    </>
  );
}
