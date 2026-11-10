import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import BookCover from '@/components/BookCover';
import ClaudeBot from '@/components/ClaudeBot';
import { GuestbookPanel } from '@/components/Guestbook';
import { GalleryPanel } from '@/components/Bookshelf';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LayoutGrid, Moon, Sun } from 'lucide-react';
import '../styles/Home.css';
import {
  experienceData,
  projectsData,
  aboutData,
} from '../data/content';
import { ProjectCarousel } from '@/components/ui/project-carousel';
import { ExperienceCard } from '@/components/ui/experience-card';
import { ExperienceTiltCard } from '@/components/ui/experience-tilt-card';
import {
  ExpandableCard,
  ExpandableCardGroup,
  ExpandableTag,
} from '@/components/ui/expandable-card';
import { useTheme } from '@/hooks/use-theme';

function IconGithub({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconLinkedIn({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconX({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L2.034 2.25h6.982l4.265 5.638 4.963-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconMail({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const SECTIONS = [
  { path: 'about', label: 'About Me', hint: "who i am", Panel: AboutPanel },
  { path: 'experiences', label: 'Experiences', hint: "where i've been", Panel: ExperiencePanel },
  { path: 'projects', label: 'Projects', hint: "what i've built", Panel: ProjectsPanel },
  { path: 'resume', label: 'Resume', hint: 'the formal stuff', Panel: ResumePanel },
  { path: 'gallery', label: 'Gallery', hint: 'some moments', Panel: GalleryPanel },
  { path: 'guestbook', label: 'Guestbook', hint: 'sign the book', Panel: GuestbookPanel },
];

// Easter egg content. Add a playlist URL to show the "listening to" line.
const SECRET_PLAYLIST = { label: '', url: '' };

function SecretPanel() {
  return (
    <div className="tab-panel gb-page">
      <div className="gb-card secret-card">
        <div className="gb-card__tab" aria-hidden />
        <h2 className="secret-card__title">you found it</h2>
        <ul className="secret-card__list">
          {SECRET_PLAYLIST.url && (
            <li>
              currently listening to:{' '}
              <a href={SECRET_PLAYLIST.url} target="_blank" rel="noopener noreferrer">
                {SECRET_PLAYLIST.label || 'my playlist'}
              </a>
            </li>
          )}
          <li>chess rating: 1936</li>
          <li>favorite opening: the Sicilian Defense</li>
          <li>ask me about: badminton footwork, why Go is underrated, or building things at 2am</li>
          <li>
            <a href={`mailto:${aboutData.email}`}>say hi</a>
          </li>
        </ul>
        <p className="secret-card__note">this page isn't in the table of contents. nice find.</p>
      </div>
    </div>
  );
}

const RESUME_URL = '/resume.pdf';

// Secret page unfolds from the top-right corner (the dog-ear).
const secretVariants = {
  initial: { opacity: 0, clipPath: 'circle(0% at 100% 0%)' },
  animate: { opacity: 1, clipPath: 'circle(150% at 100% 0%)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// dir: 1 = forward (turn page left), -1 = backward (turn page right), 0 = fade
const pageFlipEase = [0.45, 0.05, 0.25, 1];
const tabContentVariants = {
  initial: (dir) =>
    dir === 0
      ? { opacity: 0, zIndex: 1 }
      : {
          opacity: 1,
          rotateY: dir > 0 ? 88 : -88,
          transformPerspective: 2000,
          transformOrigin: dir > 0 ? 'left center' : 'right center',
          filter: 'brightness(0.88)',
          boxShadow: dir > 0
            ? '18px 0 36px rgba(0,0,0,0.22)'
            : '-18px 0 36px rgba(0,0,0,0.22)',
          zIndex: 1,
        },
  animate: (dir) => ({
    opacity: 1,
    rotateY: 0,
    filter: 'brightness(1)',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
    transformPerspective: 2000,
    transformOrigin: dir >= 0 ? 'left center' : 'right center',
    zIndex: 1,
    transition: { duration: 0.78, ease: pageFlipEase },
  }),
  exit: (dir) =>
    dir === 0
      ? { opacity: 0, zIndex: 2, transition: { duration: 0.25 } }
      : {
          opacity: 0.55,
          rotateY: dir > 0 ? -118 : 118,
          transformPerspective: 2000,
          transformOrigin: dir > 0 ? 'left center' : 'right center',
          filter: 'brightness(0.72)',
          boxShadow: dir > 0
            ? '-28px 0 48px rgba(0,0,0,0.28)'
            : '28px 0 48px rgba(0,0,0,0.28)',
          zIndex: 3,
          transition: { duration: 0.72, ease: pageFlipEase },
        },
};

function AnimatedName({ text }) {
  return (
    <h1 className="about-name">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="about-name__letter"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.04 }}
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </h1>
  );
}

function AboutPanel() {
  const building = aboutData.aboutCurrentlyBuilding;

  return (
    <div className="tab-panel tab-panel--about">
      <div className="about-page">
        <header className="about-hero">
          <div className="about-hero__name-row">
            <img src="/profile.png" alt="Maxwell Peng" className="about-photo" />
            <AnimatedName text={aboutData.name} />
          </div>
          <div className="about-pill-row">
            <span className="about-pill">{aboutData.aboutCurrently}</span>
            {aboutData.aboutAvailability && (
              <span className="about-pill about-pill--secondary">
                {aboutData.aboutAvailability}
              </span>
            )}
          </div>
          <p className="about-tagline">{aboutData.aboutTagline}</p>
          <p className="about-body">{aboutData.aboutBio}</p>
          <p className="about-body">{aboutData.aboutOpenTo}</p>
        </header>

        <section className="about-section">
          <h2 className="about-label">fun facts</h2>
          <ul className="about-list">
            {aboutData.aboutHighlights.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="about-section">
          <div className="about-interests">
            <div className="about-interests__col">
              <h2 className="about-label">what's next</h2>
              <p className="about-body">
                {aboutData.tryNext.map((item) => item.text).join(', ')}
              </p>
            </div>
            <div className="about-interests__col">
              <h2 className="about-label">off the clock</h2>
              <p className="about-body">
                {aboutData.into.map((item) => item.text).join(', ')}
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-label">in the oven</h2>
          <p className="about-building">
            <span className="about-building__name">{building.name}</span>
            {' — '}
            {building.description}
          </p>
          <a
            href={building.url}
            className="about-building__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {building.url.replace('https://', '')}
          </a>
        </section>
      </div>
    </div>
  );
}

function ExperiencePanel() {
  return (
    <div className="tab-panel tab-panel--list">
      <div className="experience-expandable-grid">
        {experienceData.map((exp, i) => (
          <ExperienceTiltCard key={exp.id}>
            <ExperienceCard exp={exp} index={i} />
          </ExperienceTiltCard>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel() {
  return (
    <div className="tab-panel tab-panel--list tab-panel--projects">
      <section className="projects-carousel-section">
        <ExpandableCardGroup>
          <ProjectCarousel projects={projectsData} />
        </ExpandableCardGroup>
      </section>
    </div>
  );
}

function ResumePanel() {
  return (
    <div className="tab-panel tab-panel--list tab-panel--resume">
      <div className="resume-window">
        <div className="resume-window__titlebar">
          <div className="resume-window__dots">
            <span className="resume-window__dot resume-window__dot--red" />
            <span className="resume-window__dot resume-window__dot--yellow" />
            <span className="resume-window__dot resume-window__dot--green" />
          </div>
          <span className="resume-window__title">resume.pdf</span>
        </div>
        <div className="resume-window__body">
          <iframe
            src={`${RESUME_URL}#view=FitH`}
            title="Maxwell Peng Resume"
            className="resume-window__iframe"
          />
        </div>
        <div className="resume-mobile-fallback">
          <a
            href={RESUME_URL}
            className="resume-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resume
          </a>
        </div>
      </div>
      <a
        href={RESUME_URL}
        className="resume-download"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download
      </a>
    </div>
  );
}

const THEME_LABEL = {
  light: 'Switch to dark mode',
  dark: 'Hollow Purple',
  purple: 'Switch to light mode',
};

function TopBar({ section, theme, toggleTheme }) {
  const wordmark = 'Maxwell Peng';
  return (
    <header className="portfolio-top-bar">
      <div className="portfolio-top-bar__inner">
        {section && (
          <span className="portfolio-wordmark" aria-label="Maxwell Peng">
            {wordmark.split('').map((char, i) => (
              <span
                key={i}
                className="portfolio-wordmark__letter"
                style={{ '--i': i }}
                aria-hidden
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        )}
        <div className="portfolio-social">
          <a
            href={aboutData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-social__link"
            aria-label="GitHub"
          >
            <IconGithub size={18} />
          </a>
          <a
            href={aboutData.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-social__link"
            aria-label="LinkedIn"
          >
            <IconLinkedIn size={18} />
          </a>
          <a
            href="https://x.com/wobblbobby"
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-social__link"
            aria-label="X (Twitter)"
          >
            <IconX size={18} />
          </a>
          <a href={`mailto:${aboutData.email}`} className="portfolio-social__link" aria-label="Email">
            <IconMail size={18} />
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="portfolio-social__link portfolio-theme-toggle"
            aria-label={THEME_LABEL[theme]}
            title={theme === 'dark' ? 'Hollow Purple' : undefined}
          >
            {/* shows the theme you'll get next: light -> moon, dark -> orb, purple -> sun */}
            {theme === 'light' ? <Moon size={18} /> : theme === 'dark' ? <span className="theme-orb" /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function TocNav() {
  return (
    <nav className="landing" aria-label="Sections">
      <h1 className="landing__header">table of contents</h1>
      <ul className="landing__list">
        {SECTIONS.map((x, i) => (
          <li key={x.path}>
            <Link to={`/${x.path}`} className="landing__tile">
              <span className="landing__num">{String(i + 1).padStart(2, '0')} —</span>
              <span className="landing__label">{x.label}</span>
              <span className="landing__hint">{x.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Page-flip overlay: TOC sheet curls away like turning a real page.
function FlipSheet({ side, onDone }) {
  const left = side === 'left';
  return (
    <div className="flip-stage" aria-hidden>
      <motion.div
        className="portfolio-container portfolio-container--tabs flip-sheet"
        style={{
          transformOrigin: left ? 'left center' : 'right center',
          transformPerspective: 1800,
        }}
        initial={{ rotateY: 0, opacity: 1, filter: 'brightness(1)' }}
        animate={{
          rotateY: left ? -128 : 128,
          opacity: [1, 1, 0.85, 0],
          filter: ['brightness(1)', 'brightness(0.95)', 'brightness(0.75)'],
        }}
        transition={{ duration: 0.95, ease: pageFlipEase }}
        onAnimationComplete={onDone}
      >
        <div className="flip-sheet__shade" />
        <TopBar section={null} theme="" toggleTheme={() => {}} />
        <main className="portfolio-main">
          <div className="portfolio-tab-surface">
            <TocNav />
          </div>
        </main>
      </motion.div>
    </div>
  );
}

// Module-level: survives in-app navigation, resets on refresh.
let coverSeen = false;

function Home({ setShowAudio }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSecret = pathname.replace(/\/+$/, '') === '/secret';
  const section = SECTIONS.find((x) => pathname.replace(/\/+$/, '') === `/${x.path}`);
  const { theme, toggleTheme, transition: themeFlash } = useTheme();
  const [showCover, setShowCover] = useState(() => !coverSeen && pathname === '/');
  const openCover = useCallback(() => {
    coverSeen = true;
    setShowCover(false);
  }, []);

  const [dir, setDir] = useState(1);
  const [flip, setFlip] = useState(null); // 'left' | 'right' while a page-flip plays
  const startFlip = (side) => {
    setFlip(side);
    if (side === 'left') {
      setShowCover(true);
    } else {
      setDir(0); // fade only; the flip supplies the motion
      navigate('/about');
    }
  };
  const idx = section ? SECTIONS.indexOf(section) : -1;
  const viaNext = useRef(false); // true only when arriving by a "next page" action
  const go = useCallback(
    (to, d, seq = false) => {
      viaNext.current = seq;
      setDir(d);
      navigate(to);
    },
    [navigate],
  );
  const goNext = () => go(idx === SECTIONS.length - 1 ? '/' : `/${SECTIONS[idx + 1].path}`, 1, true);
  const goPrev = () => go(idx <= 0 ? '/' : `/${SECTIONS[idx - 1].path}`, -1);
  const goToc = () => go('/', -1);

  // Latest handlers for the key listener without re-subscribing.
  const keysRef = useRef({});
  keysRef.current = { goNext, goPrev, goToc, active: Boolean(section) && !showCover };
  useEffect(() => {
    const onKey = (e) => {
      const k = keysRef.current;
      if (!k.active || e.metaKey || e.ctrlKey || e.altKey) return;
      // Leave arrows/Escape to inputs, the project carousel, and open modals.
      if (e.target.closest?.('input, textarea, .project-carousel__viewport')) return;
      if (document.querySelector('.xc-overlay, .fixed.inset-0.z-50')) return;
      if (e.key === 'ArrowRight') k.goNext();
      else if (e.key === 'ArrowLeft') k.goPrev();
      else if (e.key === 'Escape') k.goToc();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // One-time nudge: arrived at Gallery via "next", once per session.
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (section?.path !== 'gallery' || !viaNext.current) return;
    try { if (sessionStorage.getItem('gb_nudge')) return; } catch { return; }
    const show = setTimeout(() => {
      try { sessionStorage.setItem('gb_nudge', '1'); } catch { /* ignore */ }
      setNudge(true);
    }, 2000);
    const hide = setTimeout(() => setNudge(false), 7000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      setNudge(false);
    };
  }, [section?.path]);

  useEffect(() => {
    if (setShowAudio) setShowAudio(false);
  }, [setShowAudio]);

  return (
    <motion.div
      className="portfolio-container portfolio-container--tabs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      <AnimatePresence>{showCover && <BookCover onOpen={openCover} behind={Boolean(flip)} />}</AnimatePresence>
      <TopBar section={section} theme={theme} toggleTheme={toggleTheme} />

      {theme === 'purple' && <div className="purple-field" aria-hidden><i className="purple-field__orb purple-field__orb--red" /><i className="purple-field__orb purple-field__orb--blue" /><i className="purple-field__core" /></div>}

      {themeFlash ? (
        <div className={`theme-flash theme-flash--${themeFlash}`} aria-hidden>
          {themeFlash === 'to-light' ? (
            <>
              <span className="tl-wash" />
              <span className="tl-pond" />
              <span className="tl-ripple tl-ripple--a" />
              <span className="tl-ripple tl-ripple--b" />
              <span className="tl-orbit">
                <span className="tl-koi tl-koi--dark" aria-hidden>
                  <svg viewBox="0 0 120 56" className="tl-koi__svg">
                    <path className="tl-koi__fin tl-koi__fin--dorsal" d="M48 10 C58 2 72 0 84 8 C70 10 58 14 48 10Z" />
                    <path className="tl-koi__body" d="M18 28 C28 12 52 8 78 14 C96 18 108 24 112 28 C108 32 96 38 78 42 C52 48 28 44 18 28Z" />
                    <path className="tl-koi__fin tl-koi__fin--pectoral" d="M44 34 C38 42 34 50 42 52 C50 46 52 38 44 34Z" />
                    <path className="tl-koi__tail" d="M18 28 C8 16 2 12 4 28 C2 44 8 40 18 28Z" />
                    <path className="tl-koi__whisker" d="M100 24 C110 20 116 16 118 14" />
                    <path className="tl-koi__whisker" d="M100 32 C110 36 116 40 118 42" />
                    <circle className="tl-koi__spot" cx="92" cy="26" r="4.5" />
                    <circle className="tl-koi__eye" cx="88" cy="30" r="1.6" />
                  </svg>
                </span>
                <span className="tl-koi tl-koi--light" aria-hidden>
                  <svg viewBox="0 0 120 56" className="tl-koi__svg">
                    <path className="tl-koi__fin tl-koi__fin--dorsal" d="M48 10 C58 2 72 0 84 8 C70 10 58 14 48 10Z" />
                    <path className="tl-koi__body" d="M18 28 C28 12 52 8 78 14 C96 18 108 24 112 28 C108 32 96 38 78 42 C52 48 28 44 18 28Z" />
                    <path className="tl-koi__fin tl-koi__fin--pectoral" d="M44 34 C38 42 34 50 42 52 C50 46 52 38 44 34Z" />
                    <path className="tl-koi__tail" d="M18 28 C8 16 2 12 4 28 C2 44 8 40 18 28Z" />
                    <path className="tl-koi__whisker" d="M100 24 C110 20 116 16 118 14" />
                    <path className="tl-koi__whisker" d="M100 32 C110 36 116 40 118 42" />
                    <circle className="tl-koi__spot" cx="92" cy="26" r="4.5" />
                    <circle className="tl-koi__eye" cx="88" cy="30" r="1.6" />
                  </svg>
                </span>
              </span>
              <span className="tl-yinyang" />
              <span className="tl-bloom" />
            </>
          ) : themeFlash === 'to-purple' ? (
            <>
              <span className="tp-orb tp-orb--red" />
              <span className="tp-orb tp-orb--blue" />
              <span className="tp-flash" />
              <span className="tp-wave" />
            </>
          ) : themeFlash === 'to-dark' ? (
            <>
              <span className="theme-flash__trail" />
              <span className="theme-flash__meteor" />
              <span className="theme-flash__impact" />
              <span className="theme-flash__iris" />
              <span className="theme-flash__void" />
            </>
          ) : null}
        </div>
      ) : null}

      <main className="portfolio-main">
        <AnimatePresence mode="sync" custom={dir}>
          <motion.div
            key={isSecret ? 'secret' : section ? section.path : 'home'}
            custom={dir}
            className="portfolio-tab-surface"
            variants={isSecret ? secretVariants : tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {isSecret ? (
              <SecretPanel />
            ) : section ? (
              <section.Panel />
            ) : (
              <TocNav />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ClaudeBot
        sectionKey={isSecret ? 'secret' : section ? section.path : 'home'}
        active={!showCover && !flip && !isSecret}
      />

      <AnimatePresence>
        {nudge && (
          <motion.div
            className="gb-toast"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setNudge(false)}
          >
            you've reached the end —{' '}
            <Link to="/guestbook">sign the book</Link>?
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        Edge flip zones on every book page (TOC + sections).
        Book order: TOC (first) → about → … → guestbook (last).
        First page = forward only; last page = back only; middle = both.
      */}
      {!isSecret && !showCover && !flip && (
        <>
          {section && (
            <button
              type="button"
              className="flip-zone flip-zone--left"
              onClick={goPrev}
              tabIndex={-1}
              aria-hidden
            />
          )}
          {(!section || idx < SECTIONS.length - 1) && (
            <button
              type="button"
              className="flip-zone flip-zone--right"
              onClick={section ? goNext : () => startFlip('right')}
              tabIndex={-1}
              aria-hidden
            />
          )}
        </>
      )}
      {flip && <FlipSheet side={flip} onDone={() => setFlip(null)} />}

      {!section && !isSecret && !showCover && !flip && (
        <Link to="/secret" className="dog-ear" aria-label="Secret page" />
      )}

      {isSecret && (
        <button type="button" className="portfolio-back" onClick={goToc} aria-label="Back to contents">
          <ArrowLeft size={18} />
        </button>
      )}

      {section && (
        <>
          <button type="button" className="portfolio-back" onClick={goPrev} aria-label={idx === 0 ? 'Back to contents' : 'Previous section'}>
            <ArrowLeft size={18} />
          </button>
          <div className="portfolio-pager">
            <span>
              {String(idx + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
            </span>
            <button type="button" className="portfolio-pager__toc" onClick={goToc} aria-label="Table of contents">
              <LayoutGrid size={14} />
            </button>
          </div>
          <button
            type="button"
            className="portfolio-back portfolio-back--next"
            onClick={goNext}
            aria-label={idx === SECTIONS.length - 1 ? 'Back to contents' : 'Next section'}
          >
            <ArrowRight size={18} />
          </button>
        </>
      )}
    </motion.div>
  );
}

export default Home;
