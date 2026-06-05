export interface WorkEntry {
  company: string;
  title: string;
  roleType: RoleType;
  start: string;
  end: string;
  description: string;
}

export type RoleType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance";

export const workEntries: WorkEntry[] = [
  {
    company: "Swell Network",
    title: "Data Lead",
    roleType: "full-time",
    start: "2024-04-02",
    end: "2026-02-15",
    description:
      "Led building data pipelines and dashboards for backing the Airdrop, Vaults and User Portfolio",
  },
  {
    company: "LYS Labs",
    title: "Data Analyst",
    roleType: "part-time",
    start: "2024-07-02",
    end: "2024-12-30",
    description: "Building Clickhouse pipelines for LST and LRT analytics",
  },
  {
    company: "PYOR",
    title: "Research Data Analyst",
    roleType: "full-time",
    start: "2022-11-15",
    end: "2024-10-30",
    description:
      "First Data hire, focussing on growing presence in Data and DAO Grants space",
  },
  {
    company: "Leap Wallet",
    title: "Research Analyst",
    roleType: "contract",
    start: "2022-10-02",
    end: "2022-11-02",
    description: "Product analytics for Leap Wallet and Leap portfolio",
  },
  {
    company: "Flipside",
    title: "Data Analyst",
    roleType: "freelance",
    start: "2021-07-01",
    end: "2022-09-30",
    description:
      "Part of Flipside CEA Team, learning SQL and building dashboards on Terra and EVM DeFi",
  },
];
