export const aboutData = {
  name: "Maxwell Peng",
  title: "Full Stack Developer & Problem Solver",
  description:
    "I love to build! Anything from Chrome extensions, web apps, iOS, blockchain, to research and whatever else I can get my hands on.",
  location: "London, ON | Originally from Oakville, ON",
  email: "mpeng57@uwo.ca",
  github: "https://github.com/thecodemonki",
  linkedin: "https://www.linkedin.com/in/maxwell-peng-070116246/",
  phone: "(647) 562-2398",
  /** About tab — first line under the name */
  aboutTagline: "",
  /** About tab — availability pill next to the "Currently" pill */
  aboutAvailability: "Open to internships & full-time roles",
  /** About tab — intro paragraph */
  aboutBio:
    "I love to build! Anything from Chrome extensions, web apps, iOS, blockchain, to research and whatever else I can get my hands on. Most of all, I love making projects that have a positive impact on communities.",
  aboutOpenTo:
    "Open to collaborations and good conversations about the gym, products, and food!",
  aboutHighlights: [
    "Team Canada Junior National Team",
    "IB graduate from White Oaks Secondary",
    "Spent a couple months doing UGC content creation",
  ],
  tryNextLabel: "would love to try next:",
  tryNext: [
    { icon: "🔩", text: "Hardware" },
    { icon: "🧠", text: "Machine Learning" },
    { icon: "⛳", text: "Golf" },
    { icon: "⛷️", text: "Skiing" },
  ],
  intoLabel: "into:",
  into: [
    { icon: "🃏", text: "Poker" },
    { icon: "📈", text: "Stock market" },
    { icon: "🏸", text: "Racket sports" },
    { icon: "🏊", text: "Competitive swimming (8 years)" },
    { icon: "💻", text: "Hackathons" },
    { icon: "🍜", text: "Food" },
  ],
  aboutCurrently: "Backend Engineering Intern at Resilient Privacy",
  aboutCurrentlyBuilding: {
    name: "Dice AI",
    description: "A tax tool for content creators. Plugs into Twitch, YouTube, Stripe, and Patreon and tells you exactly what you owe.",
    url: "https://creatordice.com",
  },
};

export const educationData = {
  school: "Western University",
  location: "London, ON",
  degree: "Bachelor of Arts in Computer Science",
  graduation: "Expected August 2029",
  gpa: "3.95/4.0",
  sat: "1540",
  awards: [
    "Western Scholarship of Distinction ($3,500)",
    "Lillian H. Parsons Bursary ($1,000)",
    "EY x Accenture Case Competition Finalist"
  ],
  coursework: [
    "Computer Science Fundamentals I & II",
    "Foundations of Computer Science"
  ]
};

export const experienceData = [
  {
    id: 6,
    company: "Resilient Privacy",
    role: "Backend Engineering Intern",
    period: "August 2026 – Present",
    color: "#0f766e",
    image: "/experience/resilient-privacy.png",
    description:
      "Architected Go web scraping pipelines and stakeholder classification engines for privacy compliance outreach.",
    achievements: [
      "Built a Go web scraping pipeline detecting technology stacks from company websites via HTML, HTTP headers, and script tag analysis with 13 fingerprint rules",
      "Designed a stakeholder classification engine with regex-based confidence scoring across 5 role categories, built for independent testability across HubSpot and Salesforce",
      "Shipped an outreach recommendation engine to production, selecting contact strategy from stakeholder confidence scores and company metadata",
    ],
    tech: ["Go", "PostgreSQL", "HubSpot", "Salesforce"],
  },
  {
    id: 4,
    company: "Autumn",
    role: "Software Engineer Intern",
    period: "March 2026 – August 2026",
    color: "#14b8a6",
    image: "/experience/autumn.png",
    description: "Engineering provider onboarding flow and pre-fill system for grief counselors.",
    achievements: [
      "Cut average onboarding time from 20 min to 12 min by building a scrape-to-prefill system with Puppeteer, JWT magic-link resume, and Inngest-scheduled async email pipelines",
      "Reduced provider drop-off by 40% by engineering a 27-screen onboarding flow in Next.js/TypeScript with Zustand and a weighted real-time completion scoring engine",
      "Designed and owned the REST API and PostgreSQL data models end-to-end, writing integration tests and shipping through automated CI/CD pipelines",
    ],
    tech: ["Next.js", "Zustand", "Prisma", "PostgreSQL", "Puppeteer", "Inngest", "JWT"],
  },
  {
    id: 0,
    company: "Dice AI",
    role: "Cofounder & Software Engineer",
    period: "May 2025 – June 2026",
    color: "#7c3aed",
    image: "/experience/dice-ai.png",
    description:
      "Built and launched creatordice.com, an AI-powered tax tool for content creators.",
    achievements: [
      "Built the full platform from 0 to 1 in Next.js/PostgreSQL/Redis, designing core data models for a double-entry bookkeeping ledger and OAuth token state",
      "Shipped 10+ OAuth integrations through a unified connector layer standardizing token refresh, scoping, and rate-limit handling, cutting manual data entry by 90%",
      "Built an AI contract review pipeline with PII sanitization, structured LLM output validation, and retry logic",
    ],
    tech: ["Next.js", "Fastify", "TypeScript", "Postgres"],
  },
  {
    id: 1,
    company: "AtlasHaus Design",
    role: "Software Engineer Intern",
    period: "November 2025 – April 2026",
    color: "#f97316",
    image: "/experience/atlashaus.png",
    description: "Engineering custom Shopify solutions and optimizing e-commerce performance.",
    achievements: [
      "Engineered custom Shopify product pages using Liquid templates and JavaScript, implementing dynamic FAQ accordions and SEO-optimized structured data markup",
      "Enhanced e-commerce conversion funnel through Google Analytics and heat mapping analysis, optimizing content hierarchy and checkout flow",
      "Boosted mobile page speeds by 20% through optimized Liquid templates and strategic media lazy-loading",
    ],
    tech: ["Liquid", "JavaScript", "Shopify", "Google Analytics", "SEO"],
  },
  {
    id: 3,
    company: "Western Founders Network",
    role: "Projects Director",
    period: "September 2025 – Present",
    color: "#4a90e2",
    image: "/experience/wfn.png",
    description: "Leading technical education and project mentorship for 700+ members.",
    achievements: [
      "Led a team of 20+ to design and deliver weekly JavaScript, HTML, and CSS workshops, increasing technical engagement by 35%",
      "Organized and mentored project teams during hackathons through ideation, technical scoping, and MVP development",
      "Coordinated annual flagship Project Demo Day where 30+ teams present to industry judges - past teams earned 20+ interviews at IBM, Meta, Shopify, and notable startups",
    ],
    tech: ["JavaScript", "React", "Node.js", "Workshop Design", "Team Leadership"],
  },
  {
    id: 2,
    company: "Fae AI",
    role: "Marketing & Growth",
    period: "October 2025 – February 2026",
    color: "#ec4899",
    image: "/experience/fae-ai.png",
    description: "Led content strategy for pre-seed AI startup, achieving viral growth.",
    achievements: [
      "Led UGC and short-form content strategy across TikTok, Instagram, and YouTube",
      "Grew brand to 19K followers and 1.4M views in under a month through high-performing, trend-driven content",
      "Achieved 6-8% average engagement rate through relatable AI content (fitness, productivity, emotional support)",
    ],
    tech: ["Social Media Strategy", "Content Creation", "Analytics", "Growth Hacking"],
  },
  {
    id: 5,
    company: "Team Canada | Badminton",
    role: "Junior National Team",
    period: "September 2020 – June 2025",
    color: "#dc2626",
    image: "/experience/team-canada.png",
    description: "Competing at national level while managing athletic and academic commitments.",
    achievements: [
      "Ranked #2 Under 17 in Canada",
      "Represented Canada at 2023 XXVI Yonex PanAm Individual Championship",
      "Served as YONEX Sponsorship Representative - distributed over $7,000 in equipment, driving 15% increase in athlete engagement",
    ],
    tech: ["Performance Analytics", "Team Collaboration", "Leadership"],
  },
];

export const projectsData = [
  {
    id: 8,
    title: "SketchStorm Studio",
    description: "A 6-agent AI pipeline that turns hand-drawn sketches into working React/Tailwind apps in real time, built at the Cerebras x Google DeepMind Hackathon.",
    tech: ["FastAPI", "WebSockets", "React", "TypeScript", "Docker", "Playwright"],
    link: "#",
    color: "#ec4899",
    image: "/projects/sketchstorm-studio.png",
    highlights: [
      "Six specialized agents coordinated over WebSockets with structured inter-agent messaging and 15,000+ lines contributed",
      "Agents include Vision Parser, Architect, Code Forge, Auditor, Accessibility Checker, and Vision Critic, each independently testable",
      "26 passing tests covering pipeline fault isolation, retry logic, and Playwright visual QA with headless screenshot diffing"
    ]
  },
  {
    id: 9,
    title: "Vigil",
    description: "An open-source SRE reliability toolkit with burn rate alerting, auto-postmortem generation, real-time monitoring, and Python/JS SDKs.",
    tech: ["Go", "React", "SQLite", "GitHub API", "Python", "JavaScript"],
    link: "#",
    color: "#0ea5e9",
    image: "/projects/vigil.png",
    highlights: [
      "Two-window burn rate alerting based on the Google SRE Workbook",
      "Auto-postmortem GitHub Issue generation from incident data",
      "Real-time monitoring dashboard with Python and JavaScript SDKs for instrumentation"
    ]
  },
  {
    id: 1,
    title: "Interview Royale",
    description: "Real-time multiplayer interview practice platform supporting 10+ concurrent users with WebSocket-based communication, live video/audio streaming at 15 FPS, and OpenAI-powered answer evaluation using STAR method criteria.",
    tech: ["TypeScript", "Python", "FastAPI", "WebSocket", "OpenAI API"],
    link: "https://interviewroyale.com/",
    color: "#667eea",
    highlights: [
      "RESTful API endpoints with sub-100ms latency",
      "Proximity-based spatial audio with distance attenuation",
      "Synchronized game state across distributed clients"
    ]
  },
  {
    id: 2,
    title: "WFN Projects Website",
    description: "React website for WFN club featuring dynamic team and member profile pages, creating a centralized platform for 700+ users to explore organizational structure and discover executive responsibilities.",
    tech: ["JavaScript", "React", "HTML", "CSS", "Vite", "React Router"],
    link: "https://github.com/yourusername/wfn-projects",
    color: "#4a90e2",
    highlights: [
      "Reusable React components and structured routing",
      "Collaborative development through GitHub branches",
      "Serves 700+ active club members"
    ]
  },
  {
    id: 3,
    title: "DayFlow",
    description: "Full-featured Chrome extension to improve productivity with website white/blacklisting, focus timers, inactivity dimming, and lock-in modes. Includes usage analytics tracking daily, weekly, and monthly browsing behavior.",
    tech: ["JavaScript", "HTML", "CSS", "Chrome Extensions API"],
    link: "https://chromewebstore.google.com/detail/dayflow/pfoklgkdgoebldeobkgjcfencpjjlokp",
    githubRepo: "https://github.com/thecodemonki/DayFlow",
    color: "#2ecc71",
    highlights: [
      "Reduces distractions by 40-60% for users",
      "Data-driven habit insights and streak-based motivation",
      "Custom reminders for posture and eye-strain checks"
    ]
  },
  {
    id: 4,
    title: "StockTok",
    description: "Full stack mobile app (React Native + Expo) to dynamically price TikTok videos using custom valuation formulas based on real-time metrics. Includes full trading, portfolio, and social capabilities.",
    tech: ["React Native", "Expo", "Python", "FastAPI", "Supabase", "Railway"],
    link: "https://github.com/kevinli5371/wfn-projects2026",
    color: "#ff3b30",
    highlights: [
      "Built a REST API using Python/FastAPI with Supabase to handle auth, video scraping, and portfolio management",
      "Designed a custom valuation formula pricing TikTok videos via logarithmic growth and real-time view counts",
      "Implemented parallel TikTok video scraping using Python's ThreadPoolExecutor to refresh portfolio stats across multiple assets",
      "Developed a sell system supporting partial liquidation across multiple investment tranches with transaction fees",
      "Built a global auth context and social groups feature for leaderboards and cooperative play"
    ]
  },
  {
    id: 5,
    title: "DealFlow AI",
    description:
      "Cross-framework 6-agent M&A due diligence pipeline using LangGraph and OpenAI Agents SDK with a Band coordination layer.",
    tech: ["LangGraph", "OpenAI Agents SDK", "FastAPI", "PostgreSQL", "Docker", "Railway"],
    link: "#",
    color: "#f97316",
    image: "/projects/agentmax.png",
    highlights: [
      "Real agent-to-agent collaboration through @mentions and structured messages, every handoff flowing through a shared room",
      "The legal agent flags deal-breakers and escalates to you automatically, no manual trigger needed",
      "A deals dashboard with verdict filtering and side-by-side radar comparison across 5 risk dimensions"
    ]
  },
  {
    id: 6,
    title: "Dice AI",
    description:
      "A tax tool for content creators that plugs into Twitch, YouTube, Stripe, and Patreon and tells you what you actually owe, in real time.",
    tech: ["Next.js", "Fastify", "TypeScript", "Postgres"],
    link: "https://creatordice.com",
    color: "#8b5cf6",
    image: "/projects/dice-ai.png",
    highlights: [
      "Calculates Canadian income tax, CPP, and GST/HST live as your income comes in",
      "Anthropic AI explains your taxes in plain English instead of accountant-speak",
      "Built the whole thing solo, from auth and billing to the tax math"
    ]
  },
  {
    id: 7,
    title: "RacketSense",
    description:
      "Upload a badminton clip and a computer vision pipeline breaks down every shot you hit, then tells you things about your game you never noticed.",
    tech: ["Python", "MediaPipe", "scikit-learn", "Next.js"],
    link: "#",
    color: "#06b6d4",
    highlights: [
      "Pose estimation tracks your body frame by frame to catch every swing from raw video",
      "A Random Forest classifier sorts shots into 6 types from 9 biomechanical features per swing",
      "Markov chain analysis finds your habits, like which shot you always play after a smash"
    ]
  },
  {
    id: 8,
    title: "Defrost",
    description:
      "Paste a company's About page or screenshot it, and Defrost figures out which of your projects is most relevant, then drafts a cold email or coffee chat prep in your voice.",
    tech: ["Next.js", "TypeScript", "Cohere API"],
    link: "https://defrost-olive.vercel.app",
    color: "#ec4899",
    image: "/projects/defrost.png",
    highlights: [
      "Semantic matching engine using Cohere Embed v4 to automatically pick the most relevant portfolio project for each company",
      "Screenshot-to-text OCR via command-a-vision, so you can paste a screenshot instead of copying text by hand",
      "Few-shot prompting trained on real outreach examples to generate drafts that sound like you, not generic AI output"
    ]
  }
];

/** Years shown in the Gallery tab (oldest to newest, left to right). Each key must exist on `photosByYear`. */
export const photosYearOrder = [2025, 2026];

/** Per-year gallery rows: `{ id?, caption, src? }[]` — `src` optional; without it, a grey placeholder is shown. */
export const photosByYear = {
  2026: [],
  2025: [],
};

/** Miscellaneous gallery photos that don't belong to a specific year: `{ id?, caption, src? }[]`. */
export const photosMisc = [];

export const interestsData = [
  "Penny Stocks & Trading",
  "Basketball & Swimming (Regional)",
  "Chess (ELO: 1936)",
  "Cultural Foods & Cooking",
  "Venture Capital & Tech Startups",
  "Game Development (Roblox)",
  "Western Founders Network - Software Engineer",
  "Western Science Student Council - Finance Director",
  "Varsity Badminton"
];
// Gallery bookshelves. Photo shelves: drop images in /public/gallery/<shelf>/ and set `image`.
// A book with no `image` renders as a plain colored spine.
const placeholders = (labels) => labels.map((label, i) => ({ id: i + 1, label, image: "", caption: "" }));

export const bookshelfData = [
  { shelf: "travel & adventures", books: placeholders(["tokyo 2025", "banff", "photo 3", "photo 4", "photo 5"]) },
  { shelf: "team canada", books: placeholders(["panams", "photo 2", "photo 3", "photo 4", "photo 5"]) },
  { shelf: "hackathons & builds", books: placeholders(["hack the north", "photo 2", "photo 3", "photo 4", "photo 5"]) },
  { shelf: "food", books: placeholders(["photo 1", "photo 2", "photo 3", "photo 4", "photo 5"]) },
  {
    shelf: "reading list",
    books: [
      { id: 1, title: "Placeholder Book", author: "Author Name", color: "#2C4A5C", note: "" },
      { id: 2, title: "Placeholder Book", author: "Author Name", color: "#4A6B5D", note: "" },
      { id: 3, title: "Placeholder Book", author: "Author Name", color: "#7A2E3A", note: "" },
      { id: 4, title: "Placeholder Book", author: "Author Name", color: "#C79A2E", note: "" },
      { id: 5, title: "Placeholder Book", author: "Author Name", color: "#4B3F72", note: "" },
      { id: 6, title: "Placeholder Book", author: "Author Name", color: "#3D3830", note: "" },
    ],
  },
];
