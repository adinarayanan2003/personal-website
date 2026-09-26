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

export type JourneyEvent = {
  /** Date as shown. */
  when: string;
  /** "YYYY-MM", used to tell past steps from upcoming ones. Leave out for the open-ended last step. */
  date?: string;
  kind: "Milestone" | "Education" | "Work" | "Founder";
  title: string;
  detail?: string;
  outcomes?: string[];
  /** 0 is the main line, 1 is the side branch. */
  lane: 0 | 1;
  /** The side branch starts here. */
  branch?: boolean;
  /** The side branch ends here and merges back into the main line. */
  merge?: boolean;
  /** The main line ends here and hands over to the side branch. */
  handoff?: boolean;
  href?: string;
};

export const site = {
  name: "Adi Narayanan",
  fullName: "Adi Narayanan Koroth",
  headline: ["Founder of Owly.", "Database engineer."],
  /** The same headline, broken where it reads best on the hero. */
  headlineLines: ["Founder of Owly.", "Database engineer."],
  intro:
    "Two years at Oracle on RDBMS internals and AI agents that triage database bugs. Now I'm building Owly, AI workflows that take an ad campaign from a single brief to a published video.",
  description:
    "Founder of Owly and database engineer. Two years at Oracle on RDBMS internals and AI agents that triage database bugs, now building AI workflows for video ads.",
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

export const metrics = [
  { value: "30%", label: "less time spent triaging bugs, with SubcompIQ at Oracle" },
  { value: "80%", label: "productivity gain for my team from GenParse AI" },
  { value: "MTS-2", label: "promoted from MTS-1 for work on RDBMS internals" },
  { value: "4+", label: "years shipping software, from Ethereum to Oracle DB" },
];

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

/** In order. Present tense, so nothing goes stale when a date passes. */
export const journey: JourneyEvent[] = [
  { when: "2018", date: "2018-01", kind: "Milestone", title: "Clears NTSE", detail: "Stage II, with State Rank 14.", lane: 0 },
  {
    when: "2020",
    date: "2020-01",
    kind: "Milestone",
    title: "Clears JEE",
    detail: "99.26 percentile in JEE Main. All India Rank 8590 in JEE Advanced.",
    lane: 0,
  },
  {
    when: "Dec 2020",
    date: "2020-12",
    kind: "Education",
    title: "Joins NIT Calicut",
    detail: "B.Tech in Computer Science and Engineering. Builds Project eXPOS, an operating system for the XSM machine.",
    lane: 0,
  },
  {
    when: "Dec 2021",
    date: "2021-12",
    kind: "Work",
    title: "Joins Sarcophagus DAO",
    detail: "Builder and core developer on a decentralized dead man's switch, on Ethereum and Arweave.",
    lane: 1,
    branch: true,
  },
  {
    when: "Mar 2023",
    date: "2023-03",
    kind: "Work",
    title: "Leaves the DAO",
    detail: "After 15 months as a core developer.",
    lane: 1,
    merge: true,
  },
  { when: "May 2024", date: "2024-05", kind: "Education", title: "Graduates", detail: "B.Tech from NIT Calicut.", lane: 0 },
  {
    when: "Jun 2024",
    date: "2024-06",
    kind: "Work",
    title: "Joins Oracle",
    detail:
      "Member of Technical Staff on RDBMS internals and AI diagnostics. Promoted from MTS-1 to MTS-2. Builds SubcompIQ and GenParse AI.",
    outcomes: ["30% less triage time", "80% productivity gain"],
    lane: 0,
  },
  {
    when: "2025",
    date: "2025-01",
    kind: "Founder",
    title: "Starts Owly",
    detail: "AI workflows for ad campaigns, based in Bengaluru.",
    lane: 1,
    branch: true,
  },
  {
    when: "Oct 2026",
    date: "2026-10",
    kind: "Work",
    title: "Leaves Oracle",
    detail: "After more than two years on the database engine.",
    lane: 0,
    handoff: true,
  },
  {
    when: "Next",
    kind: "Founder",
    title: "Building Owly",
    detail: "AI workflows that take an ad campaign from a single brief to a published video.",
    lane: 1,
    href: owly.href,
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

export const recognition = [
  { title: "JEE Advanced", detail: "All India Rank 8590, out of 150,000 who qualified", year: "2020" },
  { title: "JEE Main", detail: "99.26 percentile, out of 900,000 candidates", year: "2020" },
  { title: "NTSE", detail: "Cleared Stage II with State Rank 14", year: "2018" },
];

export const nav = [
  { href: "#owly", label: "Owly" },
  { href: "#work", label: "Work" },
  { href: "#journey", label: "Journey" },
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
      metrics,
      projects: [...projects, ...moreProjects].map(({ scene: _s, sceneLabel: _l, hint: _h, ...p }) => p),
      journey,
      about,
      stack,
      recognition,
    },
    null,
    2,
  );
}
