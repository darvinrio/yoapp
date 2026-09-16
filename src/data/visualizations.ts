import type { ImageMetadata } from "astro";

import kelp_pendle from "../assets/visualizations/kelp_pendle.jpeg";
import renzo_pendle from "../assets/visualizations/renzo_pendle.jpeg";
import weeth_pendle from "../assets/visualizations/weeth_pendle.jpeg";

export interface Visualization {
  image: ImageMetadata;
  caption: string;
  date?: string;
  tweetUrl?: string;
  tags: string[];
}

export const visualizations: Visualization[] = [
  {
    image: kelp_pendle,
    caption: "@KelpDAO posting an impressive $80K fee generated from $120M swap volume, on a $130M TVL",
    date: "2024-02-21",
    tweetUrl: "https://x.com/maybeYonas/status/1760023562579259580?s=20",
    tags: ["defi", "onchain data"],
  },
  {
    image: renzo_pendle,
    caption: "@ether_fi generating $100K fee from a whopping $450M swap volume, based on a $275M TVL pool",
    date: "2024-02-21",
    tweetUrl: "https://x.com/maybeYonas/status/1760023566928707948?s=20",
    tags: ["defi", "onchain data"],
  },
  {
    image: weeth_pendle,
    caption: "@Renzo_Protocol generating $40K fees of a $90M swap volume, on a capital of $94M",
    date: "2024-02-21",
    tweetUrl: "https://x.com/maybeYonas/status/1760023570519077245?s=20",
    tags: ["defi", "onchain data"],
  },
];
