/** One role on the experience timeline. Bullets are achievement statements,
 *  written most-significant first, so the order in this file is the order a
 *  reader sees. */
export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

/** A degree, its institution, and the two numbers worth showing next to it. */
export interface EducationEntry {
  degree: string;
  school: string;
  startYear: string;
  endYear: string;
  score: string;
}

/**
 * Group headings are keys rather than array entries so the label stays tied to
 * its tags, and the declaration order is the render order on /resume.
 */
export type SkillGroups = Record<string, string[]>;

export const skills: SkillGroups = {
  "Data Analysis & Visualization": [
    "Dashboard Building",
    "Data Visualization",
    "KPI Frameworks",
  ],
  "Data Engineering": [
    "Schema Modelling",
    "Data Pipelines",
    "ClickHouse",
    "Snowflake",
  ],
  "Machine Learning": [
    "Clustering",
    "Anomaly Detection",
    "Regression Analysis",
  ],
};

export const stack: SkillGroups = {
  Languages: ["Python", "SQL", "TypeScript"],
  Libraries: ["Pandas", "Polars", "Git", "Linux", "SciKit Learn"],
  Infra: ["DBT", "Git", "Linux"],
  Visualization: ["Matplotlib", "Dune", "Superset", "Looker"],
};

export const experience: ExperienceEntry[] = [
  {
    role: "Data Lead",
    company: "Swell Network (Remote - Sydney Time)",
    period: "Apr 2024 — Feb 2026",
    bullets: [
      "Built and automated a scalable ClickHouse SQL + Python pipeline ingesting data from 150+ DeFi integrations, powering real-time user portfolio monitoring, vault KPIs, and exit liquidity health monitoring.",
      "Developed ML framework using k-Means Clustering, DBSCAN, and Louvain Community Detection to detect, flag, and penalize exploitative user behavior.",
      "Investigated a falsely marketed integration that was later rug-pulled, flagging the returns as fake based on existing liquidity and yield dynamics and escalating to the Strategy Team with a recommendation to block the integration.",
      "Drove $500M in protocol inflows by identifying outliers in liquidity concentration on Ethereum through on-chain analysis.",
      "Produced monthly summaries and technical documentation for Operations and Marketing Teams, cutting operational costs by 25% and reducing Mean Ticket Resolution time from 2+ days to 4 hours.",
      "Implemented HyperNative Risk Alerting Framework on suspicious liquidity movements, contract deployments, and code upgrades on partner integrations, providing operational risk coverage for Vault products.",
    ],
  },
  {
    role: "Research Data Analyst",
    company: "PYOR (Remote - Bengaluru)",
    period: "Oct 2022 — Oct 2024",
    bullets: [
      "Devised a quantitative analysis framework with Cohort Segmentation to evaluate ROI and user retention of $75M+ expenditure in Arbitrum DAO grants.",
      "Built automated dbt pipelines transforming raw blockchain data into standardized growth and revenue KPIs and metrics, generating $130K in ARR.",
      "Deployed high-traffic Dune Analytics dashboards to monitor LRT liquidity and peg health, translating ecosystem visibility into $150K in DAO grants acquired.",
    ],
  },
  {
    role: "Freelance Data Analyst",
    company: "Independent (Remote - Bengaluru)",
    period: "Jul 2021 — Oct 2022",
    bullets: [
      "Built the Anchor Protocol Risk Monitoring dashboard, detected unsustainable borrows beyond thresholds, and flagged systemic risk signals months before the eventual collapse.",
      "Automated the RociFi Credit Risk Reports, delivering daily updates on system health and borrow activity.",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    degree: "Master of Science - Physics",
    school: "Christ University",
    startYear: "2019",
    endYear: "2021",
    score: "8.52 CGPA",
  },
  {
    degree: "Bachelor of Science - Physics",
    school: "Christ University",
    startYear: "2016",
    endYear: "2019",
    score: "8.92 CGPA",
  },
];
