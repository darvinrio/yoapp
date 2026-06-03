---
title: "ezETH Depeg"
date: 2024-06-23
description: "An analysis of how the ezETH depeg unfolded and its impact on Balancer Pools and Morpho"
tags: ["lrt", "defi", "crypto", "data"]
---

April 24, was a dark day for LRT Leveragers and Point Farmoors. One of their favorite strategies of Looped Borrow, was dethroned viciously.
A thread on the ezETH depeg and impact on Balancer Pools. A consequence of chart crime and liquidity crunch.

## How it went down (literally)

Renzo's announcements of the end of a glorious Season 1 of Rewards, left many users unhappy with the Tokenomics and the Chart crimes, who decide to exit their ezETH positions.

![wazz-tweet](../../assets/blog-images/ezeth-depeg/wazz-tweet.png)
[Link to WazzCrypto Tweet](https://x.com/WazzCrypto/status/1782943463199174964)

With withdrawals still not live, this put a lot of burden on the ezETH liquidity on DEXes. The ezETH/WETH balancer pool, for example, was halved from a healthy 7570 ETH to 4000 ETH, on the start of 24th April.

![tvl-eth](../../assets/blog-images/ezeth-depeg/tvl-eth.jpeg)

In the early hours of 24th April 02:33 am. Morpho user 0x9CBF099ff424979439dFBa03F00B5961784c06ce gets liquidated 181 ezETH, pushing the price from 0.98 to 0.97 in a single tx.

A cascade ensues, and in the next 30 mins, 17,867 ezETH is sold for 15,758 ETH by GearBox and Morpho liquidators as, ezETH price plunges as low as 0.35 ETH, while pushing median prices down to 0.8 ETH.

![liquidations](../../assets/blog-images/ezeth-depeg/liquidations.jpeg)

The ETH balance of the Balancer Pool dropped from 3700 ETH to just 495 ETH at its lowest, before recovering to around 1000 to 1500 ETH range. The BPT price dropped from 1 ETH to 0.83 ETH at its lowest

![bal-ezeth-weth](../../assets/blog-images/ezeth-depeg/bal-ezeth-weth.jpeg)

The ezETH token depegged below 0.99 according to median of onchain DEX prices at 02:25 AM. The lowest median was registered at 02:40 AM while the lowest DEX price was at 02:55 AM. 0.99 Re-peg was achieved at 03:15 AM. A full 50 mins of depeg.

![bal-ezeth-weth-stats](../../assets/blog-images/ezeth-depeg/bal-ezeth-weth-stats.jpeg)

Volatility and contagion followed, as GearBox accounts were only liquidating now, resulting in fluctuations below the Peg.
The contagion spread to any L2 with ezETH liquidity, as arbitrageurs saw profitable crosschain trades.

![volatility](../../assets/blog-images/ezeth-depeg/volatility.jpeg)

The ezETH/wstETH pool, another major liquidity source, saw wstETH balances drop from 186 wstETH to a meagre 15 wstETH. Despite the lower liquidity, the higher ratio meant, BPT only dropped from 0.86 wstETH to 0.746 wstETH, equivalent to 0.86 ETH (assuming 1.16 ETH per wstETH)

![bal-ezeth-steth](../../assets/blog-images/ezeth-depeg/bal-ezeth-steth.jpeg)

On arbitrum, the depeg came a little late, as the 0.99 peg was broken only at 02:40 AM with a re-peg of 0.99 achieved at 03:25 AM—roughly similar length of the Ethereum depeg. Lower liquidity meant the dumping was lesser and a relatively higher median Peg was maintained.

![bal-ezeth-steth-stats](../../assets/blog-images/ezeth-depeg/bal-ezeth-steth-stats.jpeg)

During the Depeg, at its lowest, a total of 3454 ETH was removed from the pool on Ethereum, while 180 wstETH was removed from Arbitrum pool. At these lowest points, their pool shares were 2.41% on Ethereum and 3.59% on Arbitrum.

![lrt-depeg-arb](../../assets/blog-images/ezeth-depeg/lrt-depeg-arb.jpeg)

## Lessons to learn

### Leverage is risky. Both to the lender and the borrower

Gearbox and Morpho both saw 25ETH and 11ETH in bad debt. Thankfully, the debts were small and thus lenders were not affected.

![morpho-baddebt](../../assets/blog-images/ezeth-depeg/morpho-baddebt.png)
![gearbox](../../assets/blog-images/ezeth-depeg/gearbox.png)

Highly leveraged Borrowers on the other hand, like the one linked, were liquidated and lost large swathes of their collateral.

![peck-alert](../../assets/blog-images/ezeth-depeg/peck-alert.jpeg)

[PeckShieldAlert tweet](https://x.com/PeckShieldAlert/status/1782967644343439412)

### Know your protocol.

Unlike Products like AAVE, Compound- Gearbox and Morpho are Infrastructures. Curators and users handle the risk and are in charge of their risk appetite.

Only accounts with greater than 5x leverage were rinsed out, i.e 0.625 LLTV vaults were untouched. Safer choices would have resulted in better results.
![lrt-core-allocations](../../assets/blog-images/ezeth-depeg/lrt-core-allocations.png)

### Liquidity is still King.

There is no piece of Infra to blame in this event. Oracles reported correct prices, modulating out noise. Liquidations took place as intended, with minimal fuss. Only the lack of liquidity exasperates the number of liquidations.

For example, all other vaults of Morpho functioned well, with no loss to borrowers or lenders.
Even the lower LTV ezETH vault ran well-oiled. The lack of Withdrawals was partly the reason, as onchain liquidity dwindled.

![steak-king](../../assets/blog-images/ezeth-depeg/steakk.png)

[Steakhouse tweet](https://x.com/SteakhouseFi/status/1783043784877748647)

### BPT leveraging is still risky and liquidity profile dependant.

The presence of another asset provides a buffer to BPT prices. However, the composed stable pools are stable only as long as the liquidity is not skewed.

In the depegs, the BPT balances were constituted with only 4% of non-ezETH assets. The problem arises from rehypothecation, as the BPT themselves were the deepest liquidity for the token. Had this been not the case BPT would have been a safe alternative to ezETH leveraging.

### L2 Liquidity performs better despite the lower liquidity.

Gas Fees pay a major role in liquidations. This means, for certain liquidations or arbitrages to be profitable, the price must go much lower that the actual intended price.
This mean, liquidations always occur at prices lower than intended. This isn't the case in L2, where liquidations are instant.
This is why, Arbitrum price was 0.86, when Mainnet price was 0.83. Low gas fees enable smoother execution of arbitrage and liquidations.

DeFi is supposed to be empowering you to make better decisions.
All data from [Dune Dashboard](https://dune.com/maybeYonas/ezeth-depeg/ab8ca3b8-46b6-41bb-b663-1951091e7198)
