---
title: "bAssets Peg"
date: 2021-10-18
description: "Analysis of depeg events of bAssets"
tags: ["terra", "defi", "crypto", "flipside"]
--- 

The famous 20% yield of Anchor is powered by staking rewards generated from PoS assets. Currently, these are ETH and LUNA. These tokens are tokenized or bonded in the form of bETH and bLUNA, which are used as collateral to take borrows. It is the staking rewards of these tokens, that are used to fuel the 20% yield on UST deposits. A crucial piece of information here is that these staking rewards are liquidated into UST to increase the value of a-UST. Hence it is necessary that these assets hold their pegs with respect to the underlying assets. In this article, we will look into a few occasions in which these tokenized versions deviated from peg severely and will try to understand the reason behind it.

### Methodology

We will analyse the prices on a minute time-scale, due to the volatile and fast nature of crypto price action. Since we can't plot a 6 month long minute-scale data, we will first condense it into hourly-scale. Then we will pick out possible candi-dates(sneaky)  we can analyze on a minute scale.

There are two means to retrieve the price of the bAssets. One is to use the live feed into the `Anchor Oracle` contract. Or we could use swap prices from Terra's only DEX- Terraswap.

For **bETH**:

- We will use `terra.msgs` table to track the live relay of price feed of bETH into Anchor Oracle contract.
- This will be compared to WETH data in `ethereum.token_prices_hourly` to quantify the deviation from peg
- Since ETH is a relatively less volatile asset, the deviations will be measured in difference in prices of the two tokens

For **bLUNA**:

- The swaps for LUNA to bLUNA on Terraswap will be filtered from `terra.msg_events` table .
- As this gives directly the price of bLUNA with respect to LUNA, no further comparison will be required.
- Since in its current life time, LUNA is a volatile token, we
- However, this data is more likely Terra-ecosystem prices, hence Oracle feeds of bLUNA in `Anchor Oracle` contract will be compared to LUNA prices retrieved from the Validator oracle feeds stored in `terra.oracle_prices` table.

### The price action of underlying assets:

Before we delve into onchain data, we will look into market data to check for possible opportunities where de-peg might have taken place. 

The main reason for de-pegging is Panic - this causes investors in the market to quickly sell the token in their hand in order to shift to stable coins. This usually involves liquidating the bonded assets into the underlying assets. Hence there is one-way price action, causing the price to deviate from peg until arbitrageurs step in to take advantage of price.

Thus a quick sell-pressure is the main attribute for de-pegging. This can be measured by measuring the standard deviation of the log-returns of series of price data.

![LUNA/USDT pair on Binance](../../assets/blog-images/b-asset-peg/v9wSRywL.png)

LUNA/USDT pair on Binance

For LUNA, thus, May 19,23 and September 7,20 are good candidates.

![IGV54UbX.png](../../assets/blog-images/b-asset-peg/IGV54UbX.png)

As bETH was introduced only on August 14, to masses, September 7,20 are the main candidates

## bLUNA

![bluna_daily.png](../../assets/blog-images/b-asset-peg/bluna_daily.png)

![bluna_daily.png](../../assets/blog-images/b-asset-peg/bluna_daily%201.png)

In the plot above, the red line shows the lowest price attained bLUNA wrt to LUNA, while the green line is the highest price with respect to LUNA.

We notice extreme activity during the mid-May events with the prices hitting as low as 0.5 LUNA

Taking look at a more granular level 

![May 19-21](../../assets/blog-images/b-asset-peg/bluna_19.png)

May 19-21

![May 23-24](../../assets/blog-images/b-asset-peg/bluna_24.png)

May 23-24

For most people in LUNA, May was the biggest crash and also was the scariest. Mass liquidations triggered a cascade of liquidations, sending the price of LUNA extremely south and spreading mass-panic.

![Aug 16-23](../../assets/blog-images/b-asset-peg/aug_18.png)

Aug 16-23

Looking at August, it seems more like a data anomaly, rather than proper de-pegging. As we are taking swap data, it could have been a high slippage swap.

![Sep 7-12](../../assets/blog-images/b-asset-peg/bluna_sep.png)

Sep 7-12

Even September looks like a similar case of data anomaly.

Interestingly, we can see that in general, bLUNA has maintained a stable peg, with the price rarely dipping below 0.9 LUNA. Mid-May events were certainly the most stressful events on bLUNA.

## bETH

![bETH.png](../../assets/blog-images/b-asset-peg/bETH.png)

The red color area shows the deviation of the lowest price within that hour range, while the green area shows the deviation of the highest bETH price compared to the ETH price.

For bETH, we see that the most significant deviations take place between, September 19 and September 26. As the plot stacks both the positive and negative deviations, the bETH price has deviated by almost 300 USD from the actual ETH price. 

So let's take a look at a more granular level

![beth_sep.png](../../assets/blog-images/b-asset-peg/beth_sep.png)

![beth_sep.png](../../assets/blog-images/b-asset-peg/beth_sep%201.png)

Both the spikes are clearly registered in the more granular data. In both the case, we can see that the prices have deviated by 300 USD from the avg ETH price at that moment.

## Analysis

We can see that bLUNA suffered significant de-pegging on May, remained relatively stable during August and September events. bETH on the other hand suffered during the September events. 

### bLUNA

One of the main reasons for the May de-pegging was the general market crash over the quarterly Bitcoin ban from China. 

The general crash and its impact on UST and Anchor protocol has been discussed by both Anchor Devs and Me 😉 

For a full detailed analysis of the events , check : 

[](https://app.flipsidecrypto.com/dashboard/ust-anchor-impact-LYHZvJ)

**or** 

[https://mobile.twitter.com/anchor_protocol/status/1397400642566594563?lang=en](https://mobile.twitter.com/anchor_protocol/status/1397400642566594563?lang=en)

So, obviously LUNA price suffered badly, but why did bLUNA deviate from the peg.

This reason is clearly mentioned in Anchor's tweet thread:

[https://twitter.com/anchor_protocol/status/1397400652788113412?s=20](https://twitter.com/anchor_protocol/status/1397400652788113412?s=20)

Due to onchain native swaps spread, there is a limit on the conversion of LUNA to UST via native swaps on a given day. 

[https://twitter.com/terra_money/status/1396780931948564482?s=20](https://twitter.com/terra_money/status/1396780931948564482?s=20)

> *only 20 million UST can be minted a day under current parameters, this spread sometimes increased dramatically, and UST was occasionally trading at rates like $0.92. 

The core issue with the UST peg is this swap spread, which diverges from zero. [Proposal 90](https://station.terra.money/proposal/90) will significantly increase minting and redeem limits, up to more then 100 million, so spreads will be more resilient, and when nudged will recover much more quickly.

It should only take a few days for the peg to be fully restored. It’s already very close to $1, and in any case, Proposal 90 is passing currently and ends in 12 days, increasing stability of the peg.*
> 

refer to the link below for more info

[LUNA Black Swan: Terra's Do Kwon Gives AMA on What We've Learned & Anchor Action Plan](https://medium.com/@terra-bites/luna-black-swan-do-kwon-ama-on-what-weve-learned-anchor-action-plan-9d3abdacaf02)

Thus, liquidators instead went to the bLUNA/LUNA pair on Terraswap. This was an easy 2 step swap to convert bLUNA to UST. As this was a one-sided flow, bLUNA in the pool increases thus sending its exchange price down. This was crucial as in a crashing market, liquidations don't have any incentive to hold a token whose price is falling. So liquidator's hands were forced to take profits at the cost of the Network. Moreover, these increase in transactions meant, some oracle feeding transactions were dropped in the mem-pool. This also meant the price wasn't updated properly during this stress. Hence, bLUNA arbitrages didn't occur in a proper manner either.

This is also the reason why there were secondary crashes. As the peg of UST didn't regain within a single day, it meant, there were after shock LUNA mints / UST burns that caused a further downfall of LUNA and bLUNA de-pegging.

This de-pegging was however prevented in September. Albeit, this was mostly due to TFL stepping in with their liquidation bots, hence a sell pressure on LUNA was far greatly reduced. This was done to provide Anchor more lee-way till they implement Auction strategy for Liquidation.

For a detailed analysis of TFL liquidators on Anchor , check:

   

[https://twitter.com/lostindefi/status/1437440448126234627](https://twitter.com/lostindefi/status/1437440448126234627)

An important point to note here in the thread is :

[https://twitter.com/lostindefi/status/1437440483031240711?s=20](https://twitter.com/lostindefi/status/1437440483031240711?s=20)

A similar black-swan event in September was largely prevented by TFL liquidators acting in the interests of the protocol. Now with the launch of Columbus-5, a lot of fixes have been applied to these issues. However, only another event will tell us about the chinks in this armor.
