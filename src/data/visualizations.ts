import type { ImageMetadata } from "astro";

import kelp_pendle from "../assets/visualizations/kelp_pendle.jpeg";
import renzo_pendle from "../assets/visualizations/renzo_pendle.jpeg";
import weeth_pendle from "../assets/visualizations/weeth_pendle.jpeg";
import swell_pearls from "../assets/visualizations/swell_pearls.jpeg";
import io_net_sus from "../assets/visualizations/io_net_sus.jpeg";
import swell_l2 from "../assets/visualizations/swell_l2.jpeg";
import swell_l2_asset_dom from "../assets/visualizations/swell_l2_asset_dom.jpeg";
import renzo_balancer_pool_depeg from "../assets/visualizations/renzo_balancer_pool_depeg.png";
import eth_gwei_price_corr from "../assets/visualizations/eth_gwei_price_corr.jpeg";
import eigen_operator_dom from "../assets/visualizations/eigen_operator_dom.jpeg";
import eigen_operator_dom_asset from "../assets/visualizations/eigen_operator_dom_asset.jpeg";
import symbiotic_inflows from "../assets/visualizations/symbiotic_inflows.jpeg";
import symbiotic_mellow_etherfi_dom from "../assets/visualizations/symbiotic_mellow_etherfi_dom.jpeg";
import symbiotic_asset_dom from "../assets/visualizations/symbiotic_asset_dom.jpeg";
import symbiotic_lrt_dynamics from "../assets/visualizations/symbiotic_lrt_dynamics.png";
import symbiotic_cap_rise from "../assets/visualizations/symbiotic_cap_rise.png";
import babylon_btc from "../assets/visualizations/babylon_btc.jpeg";
import symbiotic_btc_user_dom from "../assets/visualizations/symbiotic_btc_user_dom.jpeg";
import babylon_cap_rise from "../assets/visualizations/babylon_cap_rise.jpeg";
import babylon_lombard_dom from "../assets/visualizations/babylon_lombard_dom.jpeg";
import babylon_mainnet_launch from "../assets/visualizations/babylon_mainnet_launch.png";
import babylon_lrt_dom from "../assets/visualizations/babylon_lrt_dom.jpeg";
import babylon_lombard_no_points from "../assets/visualizations/babylon_lombard_no_points.jpeg";
import cbbtc_conc from "../assets/visualizations/cbbtc_conc.jpeg";
import babylon_caps_raised from "../assets/visualizations/babylon_caps_raised.jpeg";
import babylon_btc_chucking from "../assets/visualizations/babylon_btc_chucking.png";
import prs from "../assets/visualizations/prs.png";
import hwhype_performance from "../assets/visualizations/hwhype_performance.jpeg";
import poly_soccer_pdelta from "../assets/visualizations/poly_soccer_pdelta.jpeg";
import poly_wc_pnl_dist from "../assets/visualizations/poly_wc_pnl_dist.jpeg";
import poly_pnl_treemap from "../assets/visualizations/poly_pnl_treemap.jpeg";
import poly_wc_top_trader from "../assets/visualizations/poly_wc_top_trader.jpeg";
import poly_wc_worst_trader from "../assets/visualizations/poly_wc_worst_trader.jpeg";
import poly_wc_worst_trader_breakdown from "../assets/visualizations/poly_wc_worst_trader_breakdown.jpeg";
import poly_wc_worst_trader_wins from "../assets/visualizations/poly_wc_worst_trader_wins.png";
import poly_wc_worst_trader_loses from "../assets/visualizations/poly_wc_worst_trader_loses.jpeg";

export interface Visualization {
  image: ImageMetadata;
  caption: string;
  date?: string;
  tweetUrl?: string;
  dataSource?: string;
  tags: string[];
}

export const visualizations: Visualization[] = [
  {
    image: kelp_pendle,
    caption:
      "@KelpDAO posting an impressive $80K fee generated from $120M swap volume, on a $130M TVL",
    date: "2024-02-21",
    tweetUrl: "https://x.com/maybeYonas/status/1760023562579259580?s=20",
    dataSource: "https://dune.com/maybeyonas/kelp-dao",
    tags: ["kelp", "pendle", "lrt", "eth", "eigen"],
  },
  {
    image: renzo_pendle,
    caption:
      "@Renzo_Protocol generating $40K fees of a $90M swap volume, on a capital of $94M",
    date: "2024-02-21",
    tweetUrl: "https://x.com/maybeYonas/status/1760023566928707948?s=20",
    dataSource: "https://dune.com/maybeyonas/renzo-protocol",
    tags: ["renzo", "pendle", "lrt", "eth", "eigen"],
  },
  {
    image: weeth_pendle,
    caption:
      "@ether_fi generating $100K fee from a whopping $450M swap volume, based on a $275M TVL pool",
    date: "2024-02-21",
    tweetUrl: "https://x.com/maybeYonas/status/1760023570519077245?s=20",
    dataSource: "https://dune.com/maybeyonas/etherfi",
    tags: ["etherfi", "pendle", "lrt", "eth", "eigen"],
  },
  {
    image: swell_pearls,
    caption: "Reverse engineering Swell's points campaign",
    date: "2024-03-13",
    tweetUrl: "https://x.com/maybeYonas/status/1767774703010390131?s=20",
    dataSource: "https://dune.com/maybeyonas/points",
    tags: ["swell", "points"],
  },
  {
    image: io_net_sus,
    caption: "IO Network having low activity before its TGE",
    date: "2024-04-04",
    tweetUrl: "https://x.com/maybeYonas/status/1775875660268896459?s=20",
    tags: ["io", "gpu"],
  },
  {
    image: swell_l2,
    caption: "Tracking pre-deposit liquidity on Swell L2",
    date: "2024-04-13",
    tweetUrl: "https://x.com/maybeYonas/status/1779093138818072998?s=20",
    dataSource: "https://dune.com/swell-network/swell-l2",
    tags: ["swell", "points"],
  },
  {
    image: swell_l2_asset_dom,
    caption: "Tracking asset dominance on Swell L2 pre-deposit",
    date: "2024-04-13",
    tweetUrl: "https://x.com/maybeYonas/status/1779093138818072998?s=20",
    dataSource: "https://dune.com/swell-network/swell-l2",
    tags: ["swell", "points"],
  },
  {
    image: renzo_balancer_pool_depeg,
    caption: "ETH to ezETH ratio fell to 5:95 from a 35:65",
    date: "2024-04-24",
    tweetUrl: "https://x.com/maybeYonas/status/1783125344536449055?s=20",
    dataSource: "https://dune.com/maybeyonas/renzo-protocol",
    tags: ["renzo", "lrt", "eth", "eigen"],
  },
  {
    image: eth_gwei_price_corr,
    caption:
      "A consistent positive correlation between ETH price and GWEI price",
    date: "2024-04-25",
    tweetUrl: "https://x.com/maybeYonas/status/1783209229291303097?s=20",
    dataSource: "https://dune.com/maybeyonas/eth-price-vs-gas-fees",
    tags: ["eth"],
  },
  {
    image: eigen_operator_dom,
    caption:
      "@Eigenpiexyz_io broke into the top 10 operator list last week. the operator is being run in conjunction with @P2Pvalidator. Generally, network effects imply, there isn't much chance for a new operator to break into top 10, unless something big happens",
    date: "2024-06-04",
    tweetUrl: "https://x.com/maybeYonas/status/1798019950340444290?s=20",
    dataSource: "https://dune.com/pyor_xyz/eigenlayer-operator-analyzer",
    tags: ["eigen"],
  },
  {
    image: eigen_operator_dom_asset,
    caption:
      "Inflow of around 200K stETH into eigen layer and delegated to @Eigenpiexyz_io operator, flows likely from his highness @justinsuntron",
    date: "2024-06-04",
    tweetUrl: "https://x.com/maybeYonas/status/1798019954450870365?s=20",
    dataSource: "https://dune.com/pyor_xyz/eigenlayer-operator-analyzer",
    tags: ["eigen"],
  },
  {
    image: symbiotic_inflows,
    caption: "600M in inflows into Symbiotic",
    date: "2024-07-04",
    tweetUrl: "https://x.com/maybeYonas/status/1808502595436138791?s=20",
    dataSource: "https://dune.com/pyor_xyz/symbiotic",
    tags: ["symbiotic"],
  },
  {
    image: symbiotic_mellow_etherfi_dom,
    caption: "Mellow and Etherfi vaults dominating Symbiotic",
    date: "2024-07-04",
    tweetUrl: "https://x.com/maybeYonas/status/1808601099664044096?s=20",
    dataSource: "https://dune.com/pyor_xyz/symbiotic",
    tags: ["symbiotic", "mellow", "etherfi"],
  },
  {
    image: symbiotic_asset_dom,
    caption: "Assets dominating TVL of Symbiotic",
    date: "2024-07-04",
    tweetUrl: "https://x.com/maybeYonas/status/1808601099664044096?s=20",
    dataSource: "https://dune.com/pyor_xyz/symbiotic",
    tags: ["symbiotic"],
  },
  {
    image: symbiotic_lrt_dynamics,
    caption: "LRT dynamics of Symbiotic post Bitcoin whitelisting",
    date: "2024-08-15",
    tweetUrl: "https://x.com/maybeYonas/status/1823858734453678456?s=20",
    dataSource: "https://dune.com/pyor_xyz/symbiotic",
    tags: ["symbiotic", "mellow", "etherfi"],
  },
  {
    image: symbiotic_cap_rise,
    caption: "Symbiotic Caps increased",
    date: "2024-08-16",
    tweetUrl: "https://x.com/maybeYonas/status/1824169968268669101?s=20",
    dataSource: "https://dune.com/pyor_xyz/symbiotic",
    tags: ["symbiotic"],
  },
  {
    image: babylon_btc,
    caption: "BTC restaking dynamics on Babylon",
    date: "2024-08-21",
    tweetUrl: "https://x.com/maybeYonas/status/1826012973745451461?s=20",
    dataSource: "https://dune.com/pyor_xyz/btc-restaking",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: symbiotic_btc_user_dom,
    caption: "BTC user base on Symbiotic",
    date: "2024-08-20",
    tweetUrl: "https://x.com/maybeYonas/status/1825917970259833322?s=20",
    dataSource: "https://dune.com/pyor_xyz/btc-restaking",
    tags: ["symbiotic", "btc"],
  },
  {
    image: babylon_cap_rise,
    caption: "Babylon Caps increased",
    date: "2024-08-22",
    tweetUrl: "https://x.com/maybeYonas/status/1826522045040980190?s=20",
    dataSource: "https://dune.com/pyor_xyz/btc-restaking",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: babylon_lombard_dom,
    caption: "Lombard dominance on Babylon",
    date: "2024-08-22",
    tweetUrl: "https://x.com/maybeYonas/status/1826596303314313512?s=20",
    dataSource: "https://dune.com/pyor_xyz/btc-restaking",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: babylon_mainnet_launch,
    caption: "Babylon Mainnet Launch",
    date: "2024-08-26",
    tweetUrl: "https://x.com/maybeYonas/status/1828098439009239297?s=20",
    dataSource: "https://dune.com/pyor_xyz/babylon-chain",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: babylon_lrt_dom,
    caption: "LRT dominance on Babylon",
    date: "2024-08-27",
    tweetUrl: "https://x.com/maybeYonas/status/1828354663923568721?s=20",
    dataSource: "https://dune.com/pyor_xyz/babylon-chain",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: babylon_lombard_no_points,
    caption: "Lombard did not deposit on Babylon, hence receiving 0 points",
    date: "2024-09-11",
    tweetUrl: "https://x.com/maybeYonas/status/1833618990649806948?s=20",
    dataSource: "https://dune.com/pyor_xyz/babylon-chain",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: cbbtc_conc,
    caption: "Supply concentration of cbBTC within top users",
    date: "2024-09-13",
    tweetUrl: "https://x.com/maybeYonas/status/1834607054805242017?s=20",
    dataSource: "https://dune.com/pyor_xyz/cbbtc",
    tags: [],
  },
  {
    image: babylon_caps_raised,
    caption: "Babylon Caps raised",
    date: "2024-10-09",
    tweetUrl: "https://x.com/maybeYonas/status/1843721670395404501?s=20",
    dataSource: "https://dune.com/pyor_xyz/babylon-chain",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: babylon_btc_chucking,
    caption: "BTC chucking on Babylon",
    date: "2024-10-09",
    tweetUrl: "https://x.com/maybeYonas/status/1843726132849553531?s=20",
    dataSource: "https://dune.com/pyor_xyz/babylon-chain",
    tags: ["babylon", "lrt", "btc"],
  },
  {
    image: prs,
    caption: "Merging a month worth of PRs",
    date: "2024-10-17",
    tags: [],
  },
  {
    image: hwhype_performance,
    caption: "Hyperwave HWHYPE performance",
    date: "2026-01-14",
    tweetUrl: "https://x.com/maybeYonas/status/2011375119822983472?s=20",
    dataSource: "https://dune.com/hyperwave/hyperwave-hwhype",
    tags: ["hyperliquid"],
  },
  {
    image: poly_soccer_pdelta,
    caption: "Visualizing distribution of Price delta as match progresses",
    date: "2026-03-20",
    tags: ["polymarket", "soccer"],
  },
  {
    image: poly_wc_pnl_dist,
    caption: "Visualizing PnL distribution of Polymarket World Cup Traders",
    date: "2026-09-01",
    tweetUrl: "https://x.com/maybeYonas/status/2094795654833070424?s=20",
    tags: ["polymarket", "soccer", "world-cup"],
  },
  {
    image: poly_pnl_treemap,
    caption: "Visualizing PnL treemap of Polymarket World Cup Trader",
    date: "2026-09-07",
    tags: ["polymarket", "soccer", "world-cup"],
  },
  {
    image: poly_wc_top_trader,
    caption: "Visualizing PnL breakdown of top trader of Polymarket World Cup",
    date: "2026-09-07",
    tags: ["polymarket", "soccer", "world-cup"],
  },
  {
    image: poly_wc_worst_trader,
    caption:
      "Visualizing PnL breakdown of worst trader of Polymarket World Cup",
    date: "2026-09-08",
    tags: ["polymarket", "soccer", "world-cup"],
  },
  {
    image: poly_wc_worst_trader_breakdown,
    caption: "Tabular PnL breakdown of worst trader of Polymarket World Cup",
    date: "2026-09-08",
    tags: ["polymarket", "soccer", "world-cup"],
  },
  {
    image: poly_wc_worst_trader_wins,
    caption: "Visualizing wins of worst trader of Polymarket World Cup",
    date: "2026-09-08",
    tags: ["polymarket", "soccer", "world-cup"],
  },
  {
    image: poly_wc_worst_trader_loses,
    caption: "Visualizing loses of worst trader of Polymarket World Cup",
    date: "2026-09-08",
    tags: ["polymarket", "soccer", "world-cup"],
  },
];
