import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import '../styles/Home.css';
import {
  experienceData,
  projectsData,
  aboutData,
  photosByYear,
  photosYearOrder,
} from '../data/content';
import { ProjectCarousel } from '@/components/ui/project-carousel';
import { ExperienceTiltCard } from '@/components/ui/experience-tilt-card';
import {
  ExpandableCard,
  ExpandableCardGroup,
  ExpandableTag,
} from '@/components/ui/expandable-card';

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

const TABS = [
  { id: 'about', label: 'about' },
  { id: 'gallery', label: 'gallery' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'resume', label: 'resume' },
];

const RESUME_URL = '/resume.pdf';

const tabContentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
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
  const current = experienceData[0];
  const building = aboutData.aboutCurrentlyBuilding;

  return (
    <div className="tab-panel tab-panel--about">
      <div className="about-page">
        <header className="about-hero">
          <div className="about-hero__name-row">
            <img src="/profile.png" alt="Maxwell Peng" className="about-photo" />
            <AnimatedName text={aboutData.name} />
          </div>
          <span className="about-pill">
            <span className="about-pill__dot" aria-hidden />
            Currently — {current.role} at {current.company}
          </span>
          <p className="about-tagline">{aboutData.aboutTagline}</p>
          <p className="about-body">{aboutData.aboutBio}</p>
          <p className="about-body">{aboutData.aboutOpenTo}</p>
        </header>

        <section className="about-section">
          <h2 className="about-label">selected work</h2>
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
      <ExpandableCardGroup>
        <div className="experience-expandable-grid">
          {experienceData.map((exp) => {
            const hasImage = Boolean(exp.image);

            return (
            <ExperienceTiltCard key={exp.id}>
            <ExpandableCard
              id={exp.id}
              title={exp.role}
              description={exp.company}
              image={exp.image}
              accentColor={exp.color}
              heroStyle={hasImage ? 'experience-banner' : 'accent-bar'}
              accentGradient={!hasImage}
              showExpandAffordance
              collapsedClassName={
                hasImage
                  ? 'expandable-card--experience experience-card experience-card--has-image w-full'
                  : 'expandable-card--experience experience-card w-full'
              }
              collapsedContentClassName="experience-card__footer"
              collapsedDescriptionClassName="experience-card__company"
              collapsedTitleClassName={hasImage ? undefined : 'text-[1.125rem] font-bold leading-tight text-[#0a0a0a]'}
              collapsedTitleAdornment={
                hasImage ? undefined : (
                <span
                  className="experience-card__badge"
                  style={{ backgroundColor: exp.color }}
                  aria-hidden
                >
                  {exp.company.charAt(0)}
                </span>
                )
              }
              collapsedContent={
                <>
                  <div className="exp-meta expandable-card__meta">
                    <div className="exp-period">{exp.period}</div>
                    <div className="exp-location">{exp.location}</div>
                  </div>
                  {exp.achievements[0] ? (
                    <p className="experience-card__teaser">
                      {exp.achievements[0]}
                    </p>
                  ) : null}
                  <div className="experience-card__tags">
                    {exp.tech.slice(0, 4).map((tag) => (
                      <ExpandableTag
                        key={tag}
                        label={tag}
                        accentColor={exp.color}
                      />
                    ))}
                  </div>
                </>
              }
            >
              <p className="exp-description">{exp.description}</p>
              <ul className="exp-achievements">
                {exp.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
              <div className="exp-tech">
                {exp.tech.map((tech) => (
                  <ExpandableTag key={tech} label={tech} accentColor={exp.color} />
                ))}
              </div>
            </ExpandableCard>
            </ExperienceTiltCard>
            );
          })}
        </div>
      </ExpandableCardGroup>
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

function GalleryPanel() {
  const [selectedYear, setSelectedYear] = useState(photosYearOrder[0]);

  const photos = photosByYear[selectedYear] ?? [];

  return (
    <div className="tab-panel tab-panel--list tab-panel--gallery">
      <h2 className="gallery-heading">gallery</h2>
      <div className="gallery-year-toggle" role="tablist" aria-label="Gallery year">
        {photosYearOrder.map((year) => (
          <button
            key={year}
            type="button"
            role="tab"
            aria-selected={selectedYear === year}
            className={`gallery-year-pill${selectedYear === year ? ' is-active' : ''}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedYear}
          className="gallery-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {photos.length === 0 ? (
            <p className="gallery-empty">no photos for {selectedYear} yet.</p>
          ) : (
            photos.map((photo, i) => (
              <figure key={photo.id ?? i} className="gallery-item">
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={photo.caption ?? ''}
                    className="gallery-item__img"
                    loading="lazy"
                  />
                ) : (
                  <div className="gallery-item__placeholder" aria-hidden />
                )}
                {photo.caption && (
                  <figcaption className="gallery-item__caption">{photo.caption}</figcaption>
                )}
              </figure>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ResumePanel() {
  return (
    <div className="tab-panel tab-panel--list tab-panel--resume">
      <div className="resume-card">
        <div className="resume-toolbar">
          <a
            href={RESUME_URL}
            className="resume-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download ↓
          </a>
        </div>
        <div className="resume-embed-wrap">
          <iframe
            src={`${RESUME_URL}#view=FitH`}
            title="Maxwell Peng Resume"
            className="resume-embed"
          />
        </div>
        <div className="resume-mobile-fallback">
          <a
            href={RESUME_URL}
            className="resume-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resume →
          </a>
        </div>
      </div>
    </div>
  );
}

function Home({ setShowAudio }) {
  const [activeTab, setActiveTab] = useState('about');

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
      <header className="portfolio-top-bar">
        <div className="portfolio-top-bar__inner">
          <span className="portfolio-wordmark" aria-hidden>
            Maxwell Peng
          </span>
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
          </div>
        </div>
      </header>

      <main className="portfolio-main">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              className="portfolio-tab-surface"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AboutPanel />
            </motion.div>
          )}
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              className="portfolio-tab-surface"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <GalleryPanel />
            </motion.div>
          )}
          {activeTab === 'experience' && (
            <motion.div
              key="experience"
              className="portfolio-tab-surface"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ExperiencePanel />
            </motion.div>
          )}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              className="portfolio-tab-surface"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ProjectsPanel />
            </motion.div>
          )}
          {activeTab === 'resume' && (
            <motion.div
              key="resume"
              className="portfolio-tab-surface"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ResumePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="portfolio-bottom-nav" aria-label="Primary">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`portfolio-bottom-nav__tab ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
}

export default Home;
