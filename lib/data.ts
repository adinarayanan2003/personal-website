import type { SceneName } from "@/lib/scenes";

export type Project = {
  slug: string;
  title: string;
  /** Short context label, shown in mono caps. */
  label: string;
  summary: string;
  /** A measured result, if there is one. */
  outcome?: string;
  tech: string[];
  /** The live pixel diagram that illustrates the project. */
  scene: SceneName;
  /** What the diagram shows, for screen readers. */
  sceneLabel: string;
  /** What the pointer does in the diagram. */
  hint?: string;
  /** How it works, in two or three short steps. */
  steps?: string[];
  href?: string;
};

export type Era = {
  id: string;
  title: string;
  /** Label for narrow screens. */
  short: string;
  kicker: string;
  years: string;
  /** Start and end as decimal years, for the era map. `to: null` means it's still going. */
  from: number;
  to: number | null;
  /** Row on the era map: 0 for places, 1 for things built alongside them. */
  lane: 0 | 1;
  tone: "neutral" | "teal-dim" | "teal" | "warm";
  body: string;
  href?: string;
};

export type OffClock = {
  id: string;
  title: string;
  status: string;
  body: string;
  scene: SceneName;
  sceneLabel: string;
  hint?: string;
};

export const site = {
  name: "Adi Narayanan",
  fullName: "Adi Narayanan Koroth",
  headline: ["Founder and engineer.", "Building Owly."],
  /** The same headline, broken where it reads best on the hero. */
  headlineLines: ["Founder and engineer.", "Building Owly."],
  intro:
    "Owly takes an ad campaign from a single brief to a published video. I also spent two years at Oracle on database internals and the AI agents that triage its bugs.",
  description:
    "Founder and engineer in Bengaluru, building Owly: AI workflows that take an ad campaign from a single brief to a published video. Two years at Oracle on database internals and AI agents.",
  location: "Bengaluru, India",
  coordinates: "12.97°N 77.59°E",
  timeZone: "Asia/Kolkata",
  email: "adinarayanan2003@gmail.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://personal-website-rho-ashen.vercel.app"),
  social: {
    github: { label: "GitHub", handle: "adinarayanan2003", href: "https://github.com/adinarayanan2003" },
    linkedin: {
      label: "LinkedIn",
      handle: "adi-narayanan-koroth",
      href: "https://www.linkedin.com/in/adi-narayanan-koroth-512401160/",
    },
    x: { label: "X", handle: "@adi_naraynan", href: "https://x.com/adi_naraynan" },
  },
} as const;

export const owly = {
  name: "Owly",
  role: "Founder",
  since: "2025",
  href: "https://www.owly.studio/",
  hrefLabel: "owly.studio",
  pitch:
    "AI workflows for ad campaigns. One brief turns into storyboards, moodboards, video ads and social posts, then an AI editor finishes the cut.",
  steps: [
    { title: "Ideation", body: "Research the audience and reverse engineer ads that already work." },
    { title: "Creation", body: "Storyboards, moodboards, videos and static posts from one brief." },
    { title: "AI editor", body: "Ask for motion graphics, trims, color grading or B-roll in plain words." },
    { title: "Publish and learn", body: "Ship the ads, see what worked, feed it into the next campaign." },
  ],
  tech: ["LangGraph", "ComfyUI", "LoRA", "React", "FFmpeg"],
  scene: "owly" as SceneName,
  sceneLabel:
    "Animated diagram: a one-line brief turns into four storyboard frames, which render into a video and get published.",
  hint: "Hover a frame",
};

const SUBCOMPIQ_LABEL =
  "Animated diagram: a new bug enters a graph of past bugs and components, and a query walks the graph to the predicted sub-component.";
const DIAG_LABEL =
  "Animated diagram: log lines stream past a scanner, errors are pulled out by the first layer and routed to components by the second.";
const VIDEO_LABEL =
  "Animated diagram: an agent issues edit commands and a video timeline trims, cuts, adds a title, changes color and exports.";
const EXPOS_LABEL =
  "Animated diagram: a page table maps virtual pages to physical memory frames, with page faults filling free frames.";

export const featured: (Project & { cta: string; target: string })[] = [
  {
    slug: "owly",
    title: "Owly",
    label: "Founder",
    summary: "AI workflows for ad campaigns, from a single brief to a published video.",
    tech: owly.tech,
    scene: "owly",
    sceneLabel: owly.sceneLabel,
    cta: "About Owly",
    target: "#owly",
  },
  {
    slug: "subcompiq-hero",
    title: "SubcompIQ",
    label: "Oracle",
    summary: "Multi-agent Graph RAG that predicts a bug's problem type and sub-component. Cut triage time by 30%.",
    tech: ["LangChain", "Graph RAG", "Python"],
    scene: "subcompiq",
    sceneLabel: SUBCOMPIQ_LABEL,
    cta: "See the work",
    target: "#work",
  },
  {
    slug: "agentic-video-hero",
    title: "Agentic Video Editor",
    label: "AI video",
    summary: "An open-source video editor turned into an agent service. Edit video with plain-language commands over MCP.",
    tech: ["MCP", "HTTP", "Python"],
    scene: "video",
    sceneLabel: VIDEO_LABEL,
    cta: "See the work",
    target: "#work",
  },
  {
    slug: "diag-ai-hero",
    title: "DIAG AI",
    label: "Oracle",
    summary: "Layered agents that read the logs, pull out the key errors and find the components involved.",
    tech: ["LangGraph", "Python", "Oracle DB"],
    scene: "diag",
    sceneLabel: DIAG_LABEL,
    cta: "See the work",
    target: "#work",
  },
];

export const projects: Project[] = [
  {
    slug: "subcompiq",
    title: "SubcompIQ",
    label: "Oracle · AI agents",
    summary: "A multi-agent system with Graph RAG that predicts a bug's problem type and the sub-component it belongs to.",
    outcome: "30% less triage time",
    tech: ["LangChain", "Graph RAG", "Python"],
    scene: "subcompiq",
    sceneLabel: SUBCOMPIQ_LABEL,
    hint: "Hover a node",
    steps: [
      "A new bug comes in and the agents read it.",
      "They walk a graph of past bugs and components to find related cases.",
      "The bug lands on the sub-component most likely to own it.",
    ],
  },
  {
    slug: "diag-ai",
    title: "DIAG AI",
    label: "Oracle · AI agents",
    summary: "Layered agents that automate bug analysis, so an engineer starts from the errors that matter.",
    tech: ["LangGraph", "Python", "Oracle DB"],
    scene: "diag",
    sceneLabel: DIAG_LABEL,
    hint: "Hover the logs to pause",
    steps: [
      "Logs from a failing run stream through the first layer.",
      "It pulls out the key errors and drops the noise.",
      "The second layer works out which components are involved.",
    ],
  },
  {
    slug: "agentic-video-editor",
    title: "Agentic Video Editor",
    label: "AI video · MCP",
    summary: "An open-source video editor turned into an agent service, so video can be edited with plain-language commands.",
    tech: ["MCP", "HTTP", "Python"],
    scene: "video",
    sceneLabel: VIDEO_LABEL,
    hint: "Move across to scrub",
    steps: [
      "The editor runs as an MCP service over HTTP.",
      "An agent sends commands like trim, cut, add a title or change the color.",
      "Each command lands on the timeline, then the cut exports.",
    ],
  },
  {
    slug: "expos",
    title: "Project eXPOS",
    label: "Systems · NIT Calicut",
    summary: "An experimental operating system written from scratch for the XSM machine.",
    tech: ["SPL", "ExpL", "XSM"],
    scene: "expos",
    sceneLabel: EXPOS_LABEL,
    hint: "Hover a memory frame",
    steps: [
      "A kernel, a BIOS and user programs for the XSM machine.",
      "Every process runs in virtual memory with its own page table.",
      "A miss raises a page fault, a free frame is found and the table updated.",
    ],
  },
];

export const moreProjects: Project[] = [
  {
    slug: "genparse-ai",
    title: "GenParse AI",
    label: "Oracle",
    summary: "An LLM coding agent for my team at Oracle.",
    outcome: "80% productivity gain",
    tech: ["LLMs", "Python"],
    scene: "genparse",
    sceneLabel: "Animated diagram: an agent reads code line by line, builds a syntax tree and writes a patch.",
  },
  {
    slug: "dns-resolver",
    title: "Recursive DNS Resolver",
    label: "Systems",
    summary: "A DNS server that walks the full resolution chain, with caching, CNAME chaining and TCP fallback.",
    tech: ["Python", "UDP/TCP"],
    scene: "dns",
    sceneLabel: "Animated diagram: a resolver queries the root, TLD and authoritative servers in turn, with cache hits and a TCP retry.",
  },
  {
    slug: "sarcophagus",
    title: "Sarcophagus",
    label: "Protocol",
    summary: "Core developer on a decentralized dead man's switch.",
    tech: ["Ethereum", "Arweave"],
    scene: "sarcophagus",
    sceneLabel: "Animated diagram: heartbeats keep a vault sealed; when they stop, a timer runs out and the vault releases its contents.",
    hint: "Keep moving to stay alive",
  },
];

/** The big chapters, in order. Overlaps are real: the DAO ran through college, Owly started during Oracle. */
export const eras: Era[] = [
  {
    id: "nitc",
    title: "NIT Calicut",
    short: "NITC",
    kicker: "College",
    years: "2020 – 2024",
    from: 2020.92,
    to: 2024.37,
    lane: 0,
    tone: "neutral",
    body: "Computer science. Wrote an operating system from scratch for the XSM machine.",
  },
  {
    id: "dao",
    title: "Sarcophagus DAO",
    short: "DAO",
    kicker: "Web3",
    years: "2021 – 2023",
    from: 2021.92,
    to: 2023.2,
    lane: 1,
    tone: "teal-dim",
    body: "Core developer on a decentralized dead man's switch, on Ethereum and Arweave, while still in college.",
  },
  {
    id: "oracle",
    title: "Oracle",
    short: "ORACLE",
    kicker: "Big tech",
    years: "2024 – 2026",
    from: 2024.42,
    to: 2026.8,
    lane: 0,
    tone: "teal",
    body: "Database internals and AI agents that triage database bugs. Promoted from MTS-1 to MTS-2.",
  },
  {
    id: "owly",
    title: "Owly",
    short: "OWLY",
    kicker: "Founder",
    years: "2025 – Now",
    from: 2025.0,
    to: null,
    lane: 1,
    tone: "warm",
    body: "AI workflows that take an ad campaign from a single brief to a published video.",
    href: owly.href,
  },
];

export const offClock: OffClock[] = [
  {
    id: "trading",
    title: "Attention trading",
    status: "Past",
    body: "Something I used to do. Ask me about it.",
    scene: "trading",
    sceneLabel: "Animated pixel chart: candles scroll across an attention index, with a crosshair on hover.",
    hint: "Hover the chart",
  },
  {
    id: "fitness",
    title: "Fitness",
    status: "Ongoing",
    body: "Gym and running.",
    scene: "fitness",
    sceneLabel: "Animated pixel figure that switches between running on a track and a barbell squat.",
    hint: "Hover to sprint",
  },
  {
    id: "dj",
    title: "DJing",
    status: "Sometimes",
    body: "Sometimes I get behind the decks.",
    scene: "dj",
    sceneLabel: "Animated pixel DJ setup: two spinning records, a mixer with bouncing levels and a scrolling waveform.",
    hint: "Move to ride the crossfader",
  },
];

export const about = [
  "I'm an engineer in Bengaluru. I care about systems that hold up at scale, whether that's a database engine, an agent that triages real bugs or a pipeline that turns a brief into a finished ad.",
  "I spent two years at Oracle on RDBMS internals and AI diagnostics. Before that I was a core developer on a decentralized protocol on Ethereum and Arweave. Owly is where the agent and video work comes together.",
  "I studied computer science at NIT Calicut. I like shipping early, measuring what changed and fixing it fast.",
];

export const stack: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "C++", "C", "SQL", "TypeScript", "JavaScript"] },
  { group: "AI and ML", items: ["LangGraph", "LangChain", "ComfyUI", "LoRA", "FAISS", "YOLO", "U-Net"] },
  { group: "Systems", items: ["Oracle DB", "Docker", "Podman", "AWS", "RunPod"] },
  { group: "Web", items: ["React", "Next.js", "Node.js"] },
];

export const nav = [
  { href: "#owly", label: "Owly" },
  { href: "#work", label: "Work" },
  { href: "#eras", label: "Eras" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/** Plain-text context for the AI chat. Only public facts from this page. No phone number. */
export function aiContext() {
  return JSON.stringify(
    {
      name: site.fullName,
      headline: site.headline.join(" "),
      intro: site.intro,
      location: site.location,
      email: site.email,
      social: Object.values(site.social).map((s) => `${s.label}: ${s.href}`),
      owly: { ...owly, scene: undefined, sceneLabel: undefined, hint: undefined },
      projects: [...projects, ...moreProjects].map(({ scene: _s, sceneLabel: _l, hint: _h, ...p }) => p),
      eras: eras.map(({ id: _id, short: _short, from: _from, to: _to, lane: _lane, tone: _tone, ...e }) => e),
      offClock: offClock.map(({ title, status, body }) => ({ title, status, body })),
      about,
      stack,
    },
    null,
    2,
  );
}
