import type { ImageMetadata } from "astro";

import lineChart from "../assets/visualizations/placeholder-stablecoin-mcap-line.svg";
import barChart from "../assets/visualizations/placeholder-dao-users-bars.svg";
import areaChart from "../assets/visualizations/placeholder-l2-tvl-area.svg";

export interface Visualization {
  image: ImageMetadata;
  caption: string;
  date?: string;
  tags: string[];
}

export const visualizations: Visualization[] = [
  {
    image: lineChart,
    caption: "Stablecoin market cap, trailing 12 months",
    date: "2026-03-01",
    tags: ["defi", "metrics"],
  },
  {
    image: barChart,
    caption: "Weekly active users across the top 10 DAOs",
    date: "2026-02-14",
    tags: ["dao", "metrics"],
  },
  {
    image: areaChart,
    caption: "Cumulative TVL across Ethereum L2s",
    tags: ["defi", "onchain data"],
  },
];
