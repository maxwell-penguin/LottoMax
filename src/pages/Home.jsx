import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import BookCover from '@/components/BookCover';
import ClaudeBot from '@/components/ClaudeBot';
import KoiFish from '@/components/KoiFish';
import MeteorImpact from '@/components/MeteorImpact';
import TerminalHeader from '@/components/TerminalHeader';
import TerminalWindow, { JsonBlock, Prompt } from '@/components/TerminalWindow';
import ExperienceLog from '@/components/ExperienceLog';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/Home.css';
import {
  projectsData,
  aboutData,
  educationData,
} from '../data/content';
import ProjectMesh from '@/components/ProjectMesh';
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

// Route table (one entry per header tab).
const SECTIONS = [
  { path: 'about', label: 'about', Panel: AboutPanel },
  { path: 'experience', label: 'experience', Panel: ExperiencePanel },
  { path: 'projects', label: 'projects', Panel: ProjectsPanel },
  { path: 'resume', label: 'resume', Panel: ResumePanel },
  { path: 'contact', label: 'contact', Panel: ContactPanel },
];
const NAV = SECTIONS;

// Easter egg content. Add a playlist URL to show the "listening to" line.
const SECRET_PLAYLIST = { label: '', url: '' };

function SecretPanel() {
  return (
    <div className="tab-panel secret-page">
      <div className="secret-card">
        <div className="secret-card__tab" aria-hidden />
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
        <p className="secret-card__note">this page isn't linked anywhere. nice find.</p>
      </div>
    </div>
  );
}

const RESUME_URL = '/resume.pdf';

// Secret page unfolds from the top-right corner.
const secretVariants = {
  initial: { opacity: 0, clipPath: 'circle(0% at 100% 0%)' },
  animate: { opacity: 1, clipPath: 'circle(150% at 100% 0%)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
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

// Loose "focus" tags for the JSON block (from the resume's skills).
const ABOUT_FOCUS = ['backend', 'AI/ML', 'full-stack web'];
const ABOUT_INTERESTS = ['badminton', 'chess', 'poker', 'racket sports', 'swimming'];

function Comment({ children, className = '' }) {
  return (
    <p className={`about-comment ${className}`.trim()}>
      <span className="about-comment__slashes">// </span>
      {children}
    </p>
  );
}

function AboutPanel() {
  const building = aboutData.aboutCurrentlyBuilding;
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const json = {
    name: aboutData.name,
    school: educationData.school,
    grad: Number(educationData.graduation.match(/\d{4}/)?.[0]),
    role: aboutData.aboutCurrently.replace(' at ', ' @ '),
    focus: ABOUT_FOCUS,
    status: lower(aboutData.aboutAvailability),
    building: building.name,
    interests: ABOUT_INTERESTS,
  };

  return (
    <div className="tab-panel tab-panel--about">
      <div className="about-page">
        <header className="about-hero">
          <div className="about-hero__name-row">
            <img src="/profile.png" alt="Maxwell Peng" className="about-photo" />
            <AnimatedName text={aboutData.name} />
          </div>
        </header>

        <TerminalWindow title="maxwell — bash — 80x24">
          <Prompt>cat about.json</Prompt>
          <JsonBlock data={json} />
        </TerminalWindow>

        <section className="about-comments">
          <Comment>
            Computer Science at {educationData.school}, expected{' '}
            {educationData.graduation.match(/\d{4}/)?.[0]}.
          </Comment>
          <Comment>{aboutData.aboutBio}</Comment>
          <Comment>Currently: {aboutData.aboutCurrently}.</Comment>
          <Comment>
            Notable: {aboutData.aboutNotable.primary}. {aboutData.aboutNotable.secondary}.
          </Comment>
          <Comment>What's next: {lower(aboutData.aboutNext)}.</Comment>
          <Comment>Off the clock: {lower(aboutData.aboutOffClock)}.</Comment>
        </section>

        <section className="about-comments about-comments--oven">
          <Comment className="about-comment--head">in the oven</Comment>
          <Comment>
            <span className="about-building__name">{building.name}</span>: {building.description}
          </Comment>
          <Comment>
            <a
              href={building.url}
              className="about-building__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {building.url.replace('https://', '')}
            </a>
          </Comment>
        </section>
      </div>
    </div>
  );
}

function ExperiencePanel() {
  return <ExperienceLog />;
}

function ProjectsPanel() {
  return <ProjectMesh projects={projectsData} />;
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
            loading="lazy"
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

function ContactPanel() {
  const links = [
    { label: 'email', href: `mailto:${aboutData.email}`, text: aboutData.email, Icon: IconMail },
    { label: 'linkedin', href: aboutData.linkedin, text: 'linkedin.com/in/maxwell-peng', Icon: IconLinkedIn },
    { label: 'github', href: aboutData.github, text: aboutData.github.replace('https://', ''), Icon: IconGithub },
    { label: 'x', href: 'https://x.com/wobblbobby', text: '@wobblbobby', Icon: IconX },
  ];
  return (
    <div className="tab-panel tab-panel--contact">
      <div className="about-page">
        <h2 className="about-label">contact</h2>
        <p className="about-body">The fastest way to reach me is email. I read everything.</p>
        <ul className="contact-list">
          {links.map(({ label, href, text, Icon }) => (
            <li key={label}>
              <a
                href={href}
                className="contact-link"
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Icon size={18} />
                <span className="contact-link__label">{label}</span>
                <span className="contact-link__text">{text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Module-level: survives in-app navigation, resets on refresh.
let coverSeen = false;

function Home({ setShowAudio }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, transition: themeFlash, transitionGo: themeGo } = useTheme();
  const path = pathname.replace(/\/+$/, '') || '/';
  const isSecret = path === '/secret';
  const match = SECTIONS.find((x) => path === `/${x.path}`);
  // '/' (behind the cover) and unknown paths show About
  const section = isSecret ? null : match ?? SECTIONS[0];
  const [showCover, setShowCover] = useState(() => !coverSeen && path === '/');
  const openCover = useCallback(() => {
    coverSeen = true;
    setShowCover(false);
    navigate('/about', { replace: true });
  }, [navigate]);

  // '/', old routes (e.g. /experiences), anything unknown -> /about (once the intro isn't showing)
  useEffect(() => {
    if (!showCover && !isSecret && !match) navigate('/about', { replace: true });
  }, [showCover, isSecret, match, navigate]);

  // ── single scrollable page: every section is a full-height scroll-snap block ──
  const scrollerRef = useRef(null);
  const target = useRef(null); // section we're smooth-scrolling to (ignore passing sections)
  const settleTimer = useRef();
  const pathRef = useRef(path);
  pathRef.current = path;
  const [live, setLive] = useState(section ? section.path : SECTIONS[0].path); // section in view

  const sectionInView = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return SECTIONS[0].path;
    const y = el.scrollTop + el.clientHeight * 0.4;
    let name = SECTIONS[0].path;
    for (const x of SECTIONS) {
      const sec = el.querySelector(`#s-${x.path}`);
      if (sec && sec.offsetTop <= y) name = x.path;
    }
    return name;
  }, []);

  const scrollToSection = useCallback((name, behavior) => {
    const sec = scrollerRef.current?.querySelector(`#s-${name}`);
    if (!sec) return;
    target.current = behavior === 'smooth' ? name : null;
    sec.scrollIntoView({ behavior, block: 'start' });
    if (behavior === 'smooth') window.setTimeout(() => { target.current = null; }, 1500);
  }, []);

  // direct URLs (/experience) and coming back from /secret land on the right section, no animation
  useLayoutEffect(() => {
    if (isSecret) return;
    scrollToSection(section.path, 'instant');
    setLive(section.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSecret]);

  // URL changed (tab click, `cd`, back/forward) -> smooth-scroll there
  useEffect(() => {
    if (isSecret || showCover || !scrollerRef.current) return;
    if (sectionInView() === section.path) return;
    scrollToSection(section.path, 'smooth');
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  // scrolling: highlight live, push the URL once the scroll settles
  const onScroll = useCallback(() => {
    const name = sectionInView();
    setLive((prev) => (prev === name ? prev : name));
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const settled = sectionInView();
      if (target.current) {
        if (settled !== target.current) return;
        target.current = null;
      }
      if (pathRef.current !== `/${settled}`) navigate(`/${settled}`);
    }, 140);
  }, [navigate, sectionInView]);
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

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
      <AnimatePresence>{showCover && <BookCover onOpen={openCover} />}</AnimatePresence>
      <TerminalHeader nav={NAV} path={path} active={isSecret ? null : `/${live}`} theme={theme} toggleTheme={toggleTheme} navigate={navigate} />

      {theme === 'dark' && <div className="dark-crater" aria-hidden />}
      {theme === 'purple' && <div className="purple-field" aria-hidden><i className="purple-field__orb purple-field__orb--red" /><i className="purple-field__orb purple-field__orb--blue" /><i className="purple-field__core" /></div>}

      {themeFlash ? (
        <div className={`theme-flash theme-flash--${themeFlash}`} aria-hidden>
          {themeFlash === 'to-light' ? (
            <>
              <span className="tl-wash" />
              <span className="tl-ripple tl-ripple--a" />
              <span className="tl-ripple tl-ripple--b" />
              <span className="tl-orbit">
                <span className="tl-koi-slot tl-koi-slot--top" aria-hidden>
                  {/* dark koi enters from the left */}
                  <KoiFish variant="dark" />
                </span>
                <span className="tl-koi-slot tl-koi-slot--bottom" aria-hidden>
                  {/* light koi enters from the right */}
                  <KoiFish variant="light" />
                </span>
              </span>
              <span className="tl-bloom" />
            </>
          ) : themeFlash === 'to-purple' ? (
            <>
              <span className="tp-orb tp-orb--red" />
              <span className="tp-orb tp-orb--blue" />
              <span className="tp-fuse" />
              <span className="tp-flash" />
              <span className="tp-wave" />
            </>
          ) : themeFlash === 'to-dark' ? (
            <MeteorImpact go={themeGo} />
          ) : null}
        </div>
      ) : null}

      <main className="portfolio-main">
        {isSecret ? (
          <motion.div
            key="secret"
            className="portfolio-tab-surface"
            variants={secretVariants}
            initial="initial"
            animate="animate"
          >
            <SecretPanel />
          </motion.div>
        ) : (
          <div ref={scrollerRef} className="portfolio-tab-surface snap-surface" onScroll={onScroll}>
            {SECTIONS.map((x) => (
              <section key={x.path} id={`s-${x.path}`} className="snap-section" aria-label={x.label}>
                <x.Panel />
              </section>
            ))}
          </div>
        )}
      </main>

      <ClaudeBot sectionKey={isSecret ? 'secret' : live} active={!showCover && !isSecret && live !== 'about'} />

      {isSecret && (
        <button type="button" className="portfolio-back" onClick={() => navigate('/about')} aria-label="Back to about">
          <ArrowLeft size={18} />
        </button>
      )}
    </motion.div>
  );
}

export default Home;
