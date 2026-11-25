import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useCallback } from 'react';
import BookCover from '@/components/BookCover';
import ClaudeBot from '@/components/ClaudeBot';
import KoiFish from '@/components/KoiFish';
import MeteorImpact from '@/components/MeteorImpact';
import { GuestbookPanel } from '@/components/Guestbook';
import TerminalHeader from '@/components/TerminalHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

// Route table. `hidden` routes work by URL but aren't in the header tabs.
const SECTIONS = [
  { path: 'about', label: 'about', Panel: AboutPanel },
  { path: 'experience', label: 'experience', Panel: ExperiencePanel },
  { path: 'projects', label: 'projects', Panel: ProjectsPanel },
  { path: 'resume', label: 'resume', Panel: ResumePanel },
  { path: 'contact', label: 'contact', Panel: ContactPanel },
  { path: 'guestbook', label: 'guestbook', Panel: GuestbookPanel, hidden: true },
];
const NAV = SECTIONS.filter((x) => !x.hidden);

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

const tabContentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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
        </header>

        <section className="about-section">
          <h2 className="about-label">notable</h2>
          <p className="about-notable__primary">{aboutData.aboutNotable.primary}</p>
          <p className="about-notable__secondary">{aboutData.aboutNotable.secondary}</p>
        </section>

        <section className="about-section">
          <div className="about-interests">
            <div className="about-interests__col">
              <h2 className="about-label">what's next</h2>
              <p className="about-body">{aboutData.aboutNext}</p>
            </div>
            <div className="about-interests__col">
              <h2 className="about-label">off the clock</h2>
              <p className="about-body">{aboutData.aboutOffClock}</p>
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

  // '/', /gallery, /experiences, anything unknown -> /about (once the intro isn't showing)
  useEffect(() => {
    if (!showCover && !isSecret && !match) navigate('/about', { replace: true });
  }, [showCover, isSecret, match, navigate]);

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
      <TerminalHeader nav={NAV} path={path} theme={theme} toggleTheme={toggleTheme} navigate={navigate} />

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
        <AnimatePresence mode="sync">
          <motion.div
            key={isSecret ? 'secret' : section.path}
            className="portfolio-tab-surface"
            variants={isSecret ? secretVariants : tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {isSecret ? <SecretPanel /> : <section.Panel />}
          </motion.div>
        </AnimatePresence>
      </main>

      <ClaudeBot
        sectionKey={isSecret ? 'secret' : section.path}
        active={!showCover && !isSecret && section.path !== 'about'}
      />

      {isSecret && (
        <button type="button" className="portfolio-back" onClick={() => navigate('/about')} aria-label="Back to about">
          <ArrowLeft size={18} />
        </button>
      )}
    </motion.div>
  );
}

export default Home;
