import type { SvgComponent } from "astro/types";

export interface WorkEntry {
  company: string;
  title: string;
  roleType: RoleType;
  start: string;
  end: string;
  logo: SvgComponent;
  description: string;
}

export type RoleType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance";
