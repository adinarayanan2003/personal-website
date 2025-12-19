export const siteData = {
    name: "Adi Narayanan Koroth",
    tagline: "Database Engineer & AI Systems Builder",
    location: "Bengaluru, India",
    email: "adinarayanan2003@gmail.com",
    phone: "+91 9061453133",

    social: {
        linkedin: "https://www.linkedin.com/in/adi-narayanan-koroth-512401160/",
        github: "https://github.com/adinarayanan2003",
        twitter: "https://x.com/adi_naraynan"
    },

    about: "Building AI-driven diagnostic systems and database internals at Oracle. Previously contributed to decentralized protocols. I ship fast, iterate faster, and care deeply about systems that work at scale.",

    currently: [
        "Building AI video tooling at Owly",
        "Working on database internals at Oracle",
        "Exploring scalable AI infrastructure"
    ],

    experience: [
        {
            company: "Oracle",
            role: "Member of Technical Staff 2",
            location: "Bengaluru, India",
            duration: "Jun 2024 – Present",
            highlights: [
                "Promoted from MTS-1 to MTS-2 for significant contributions to RDBMS internals and AI-driven diagnostic systems",
                "Built SubcompIQ: Multi-agentic Graph RAG system reducing bug triage time by 30%",
                "Developed GenParse AI: LLM-based coding agent improving team productivity by 80%"
            ]
        },
        {
            company: "Sarcophagus DAO",
            role: "Builder",
            location: "Remote",
            duration: "Dec 2021 – Mar 2023",
            highlights: [
                "Core developer on decentralized dead man's switch protocol",
                "Built on Ethereum & Arweave blockchains"
            ]
        }
    ],

    projects: [
        {
            title: "Owly",
            description: "Production-ready AI video creation tool with programmatic video generation, motion graphics, and automated editing.",
            tech: ["LangGraph", "ComfyUI", "LoRA", "React", "FFmpeg"],
            featured: true
        },
        {
            title: "Agentic Video Editor",
            description: "Converted open-source video editor into an agentic service, enabling video manipulation through natural language commands.",
            tech: ["MCP", "HTTP", "Python"],
            featured: true
        },
        {
            title: "SubcompIQ",
            description: "Multi-agentic system with Graph RAG integration to predict bug problem types and sub-components.",
            tech: ["LangChain", "Graph RAG", "Python"],
            featured: true
        },
        {
            title: "DIAG AI",
            description: "Multi-layer agentic system to automate bug analysis by identifying key errors and determining relevant components.",
            tech: ["LangGraph", "Python", "Oracle DB"],
            featured: true
        },
        {
            title: "Recursive DNS Resolver",
            description: "Full resolution chain DNS server handling iterative lookups, caching, CNAME chaining, and TCP fallback.",
            tech: ["Python", "UDP/TCP", "Networking"],
            featured: true
        },
        {
            title: "Project eXPOS",
            description: "Experimental OS built from scratch implementing virtual memory, page tables, and BIOS for XSM architecture.",
            tech: ["Spl", "Expl", "XSM"],
            featured: true
        }
    ],

    skills: {
        "Languages": ["Python", "C++", "C", "SQL", "JavaScript", "TypeScript"],
        "AI & ML": ["LangChain", "LangGraph", "ComfyUI", "LoRA", "FAISS", "YOLO", "U-Net"],
        "Systems": ["Oracle DB", "Docker", "Podman", "AWS", "RunPods"],
        "Web": ["React", "Next.js", "Node.js", "HTML/CSS"]
    },

    education: {
        institution: "National Institute of Technology Calicut",
        degree: "B.Tech in Computer Science and Engineering",
        duration: "Dec 2020 – May 2024"
    },

    achievements: [
        { title: "JEE Advanced", detail: "All India Rank 8590 amongst 150,000 qualified", year: "2020" },
        { title: "JEE Mains", detail: "99.26 Percentile (top 1% of 900,000 students)", year: "2020" },
        { title: "NTSE", detail: "Qualified Stage II with State Rank 14", year: "2018" }
    ]
};

export type SiteData = typeof siteData;
