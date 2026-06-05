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
    start: "2024-04-01",
    end: "2026-02-15",
    description:
      "Lead building data pipelines and dashboards for backing the Airdrop, Vaults and User Portfolio",
  },
  {
    company: "PYOR",
    title: "Research Data Analyst",
    roleType: "full-time",
    start: "2020-01-15",
    end: "2022-05-30",
    description:
      "First Data hire, focussing on growing presence in Data and DAO Grants space",
  },
  {
    company: "Independent",
    title: "Data Analyst",
    roleType: "freelance",
    start: "2021-07-01",
    end: "2022-09-30",
    description:
      "Part of Flipside CEA Team, learning SQL and building dashboards on Terra and EVM DeFi",
  },
];
