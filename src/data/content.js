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
    "I love to build! Anything from Chrome extensions, web apps, iOS, blockchain, to research and whatever else I can get my hands on.",
  aboutOpenTo:
    "Open to collaborations and good conversations about the gym, products, and food!",
  aboutCurrentRole: "Recently working at Resilient Privacy Inc",
  aboutHighlights: [
    "Interned at Autumn: built provider onboarding flows and a LinkedIn scrape-to-prefill system for grief counselors across Canada",
    "Team Canada Junior National Team: badminton, PanAm competitor, ranked #2 U17 in Canada",
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
    id: 0,
    company: "Dice AI",
    role: "Founder",
    location: "Oakville, ON",
    period: "May 2026 – Present",
    color: "#7c3aed",
    image: "/experience/dice-ai.png",
    description:
      "Built and launched creatordice.com, an AI-powered tax tool for content creators.",
    achievements: [
      "Engineered a Canadian tax engine covering federal and Ontario income brackets, CPP Tier 1 & 2, and GST/HST registration thresholds",
      "Integrated Anthropic AI to generate plain-English tax explanations personalized to each user's income and jurisdiction",
      "Built and shipped the full product solo, from auth and billing to OAuth integrations across 6 platforms",
    ],
    tech: ["Next.js", "Fastify", "TypeScript", "Postgres"],
  },
  {
    id: 4,
    company: "Autumn",
    role: "Software Engineer Intern",
    location: "Remote — London, ON",
    period: "March 2025 – Present",
    color: "#14b8a6",
    image: "/experience/autumn.png",
    description: "Engineering provider onboarding flow and pre-fill system for grief counselors.",
    achievements: [
      "Engineered a provider onboarding flow (27 screens, 7 steps) in Next.js with Zustand, Prisma/PostgreSQL, and a weighted real-time completion scoring engine for grief counselors to publish SEO-structured profiles on autumn.co",
      "Built a LinkedIn and website scrape-to-prefill system using Puppeteer with silent failure handling, JWT magic-link resume, and Inngest-scheduled abandonment email sequences to minimize drop-off across a 15–20 minute onboarding flow",
    ],
    tech: ["Next.js", "Zustand", "Prisma", "PostgreSQL", "Puppeteer", "Inngest", "JWT"],
  },
  {
    id: 1,
    company: "AtlasHaus Design",
    role: "Software Engineer Intern",
    location: "Remote — Ottawa, ON",
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
    location: "London, ON",
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
    location: "Remote — New York",
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
    location: "Oakville, ON",
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
    id: 1,
    title: "Interview Royale",
    description: "Real-time multiplayer interview practice platform supporting 10+ concurrent users with WebSocket-based communication, live video/audio streaming at 15 FPS, and OpenAI-powered answer evaluation using STAR method criteria.",
    tech: ["TypeScript", "Python", "FastAPI", "WebSocket", "OpenAI API"],
    link: "https://interviewroyale.com/",
    color: "#667eea",
    image: "/projects/interview-royale.png",
    highlights: [
      "RESTful API endpoints with sub-100ms latency",
      "Proximity-based spatial audio with distance attenuation",
      "Synchronized game state across distributed clients"
    ]
  },
  {
    id: 2,
    title: "Western Founders Network Projects Website",
    description: "React website for WFN club featuring dynamic team and member profile pages, creating a centralized platform for 700+ users to explore organizational structure and discover executive responsibilities.",
    tech: ["JavaScript", "React", "HTML", "CSS", "Vite", "React Router"],
    link: "https://github.com/yourusername/wfn-projects",
    color: "#4a90e2",
    image: "/projects/wfn.png",
    highlights: [
      "Reusable React components and structured routing",
      "Collaborative development through GitHub branches",
      "Serves 700+ active club members"
    ]
  },
  {
    id: 3,
    title: "DayFlow Chrome Extension",
    description: "Full-featured Chrome extension to improve productivity with website white/blacklisting, focus timers, inactivity dimming, and lock-in modes. Includes usage analytics tracking daily, weekly, and monthly browsing behavior.",
    tech: ["JavaScript", "HTML", "CSS", "Chrome Extensions API"],
    link: "https://chromewebstore.google.com/detail/dayflow/pfoklgkdgoebldeobkgjcfencpjjlokp",
    githubRepo: "https://github.com/thecodemonki/DayFlow",
    color: "#2ecc71",
    image: "/projects/dayflow.png",
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
    title: "AgentMax",
    description:
      "Six AI agents that team up to run M&A due diligence and hand you a scored investment memo in under 60 seconds.",
    tech: ["LangGraph", "GPT-4o", "FastAPI", "Railway"],
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