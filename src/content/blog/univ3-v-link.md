---
title: "Uniswap v3 vs Chainlink"
date: 2022-09-07
description: "Comparing Uniswap v3 and Chainlink Oracles"
tags: ["oracles", "defi", "crypto"]
--- 

## Implementation:

### Uniswap v3:

- A simple **TWAP oracle of historical DEX ticks** (a modified representation of price)
- Internally tracks an array of historical TWAP cumulative values for each trade and its timestamp
- From TWAP cumulatives, TWAP can be calculated by dividing the difference between TWAP cumulatives and time in seconds elapsed between them :

$$
{TWAP}_{now} = \frac{  tickCumulative_{now} - tickCumulative_{previous}}{timeElapsed} 
$$

- Then this Tick TWAP can be converted to Price TWAP
- Each Pool in Uniswap v3 has its own TWAP, in the form of a cyclic array
- The array is initialized with size 1, i.e track the latest value alone; however can be modified to track up to 65,536 instances (roughly 9 days of historical data if each block price tick is tracked)
- User can pass array of `timeAgos` (seconds to lookback) and construct a TWAP of required length
- As TWAP is generated from Pools, only ERC-20 data can be obtained

## Chainlink:

- Uses a Proof-of-Stake like implementation of a network of nodes that pass data to the `Chainlink  Aggregator Contracts`.
- Aggregator Contract validates this data, processes it and sends it to a requesting contract.
- Behind the Aggregator Contracts are `Reputation` and `Order Matching` contracts that handle historical performance of nodes and the node selection.
- Each request if fulfilled by a subset of nodes, who are selected based on `Reputation`; which is  a function of $LINK staked, i.e more $LINK staked, more probability of being selected to fulfill request
- Generally, when a Aggregator, Reputation and Order Matching contracts are deployed, a `Requester` contract is also deployed by the data requesting party, which pays the nodes in exchange for the data.
- Data validation is usually performed as a majority vote, i.e if a contract requests ETH price, a subset of 5 nodes are selected to full fill the request, if 3 relay 3000 ETH and 2 relay 2900 ETH, 3000 ETH is the selected answer.
- Chainlink can iterate the request amongst multiple subsets to improve accuracy and weedout outliers
- Outliers could receive LINK slashing
- Since Data is fed in by Nodes, virtually any data can be imported into blockchain

The usecases of ChainLink oracles, are

- DataFeeds (getting streams of data, like price history of asset) - [Further Reference](https://docs.chain.link/docs/consuming-data-feeds/)
- Random Number Generator ( blockchains are deterministic, hence randomness  generation is not possible onchain)  - [Further Reference](https://docs.chain.link/docs/vrf/v2/introduction/)
- Keepers or Contract Automation ( blockchains require transactions to change state, hence for any event to trigger, an transaction is required, which means onchain automation isn’t possible) - [Further Reference](https://docs.chain.link/docs/chainlink-keepers/introduction/)
- Querying offchain APIs (blockchains are independent from outside world, with transactions being the only way to interact, hence Querying APIs need a transaction from outside to be fullfilled ) - [Further Reference](https://docs.chain.link/docs/any-api/introduction/)

---

## Code:

## Uniswap:

Given an array of `secondsAgos`, i.e seconds to look back , calling `observe` function on the `IUniswapV3Pool` pair will return the tickCumulatives. 

```solidity
function observe(uint32[] calldata secondsAgos)
    external
    view
    returns (
			int56[] memory tickCumulatives, 
			uint160[] memory secondsPerLiquidityCumulativeX128s
);
```

Once the tickCumulatives are obtained, the current TWAP can be calculated using the formula above. Ticks can be converted to price using formula 

$$
Price =  \sqrt{1.0001^{Tick}}
$$

However, inorder to reduce math issues with solidity, Uniswapv3 provide `TickMath.getSqrtRatioAtTick` function to return a value equal to `$Price * 2^{96}$`

```solidity
function getSqrtRatioAtTick(
    int24 tick
  ) internal pure returns (uint160 sqrtPriceX96)
```

Once we obtain `sqrtPriceX96`, Uniswap’s `FullMath.mulDiv` function can be used to do the necessary multiplication and division to obtain the final price in the format required. 

```solidity
function mulDiv(
    uint256 a,
    uint256 b,
    uint256 denominator
  ) internal pure returns (uint256 result)
```

The code implementation of a simple TWAP:

```solidity
function getSqrtTwapX96(
	address uniswapV3Pool, 
	uint32 twapInterval) public view returns (uint160 sqrtPriceX96) {
	    if (twapInterval == 0) {
	        // return the current price if twapInterval == 0
	        (sqrtPriceX96, , , , , , ) = IUniswapV3Pool(uniswapV3Pool).slot0();
	    } else {
	        uint32[] memory secondsAgos = new uint32[](2);
	        secondsAgos[0] = twapInterval; // from (before)
	        secondsAgos[1] = 0; // to (now)
	
	        (int56[] memory tickCumulatives, ) = IUniswapV3Pool(uniswapV3Pool).observe(secondsAgos);
	
	        // tick(imprecise as it's an integer) to price
	        sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
	            int24((tickCumulatives[1] - tickCumulatives[0]) / twapInterval)
	        );
	    }
    }

		// returns price without decimal adjustment from sqrtPrice
    function getPriceX96FromSqrtPriceX96(uint160 sqrtPriceX96) public pure returns(uint256 priceX96) {
        return FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
    }
```

## Chainlink:

Provided there is already a open Aggregator contract in place, Token price feeds are easy to implement. A sample contract that queries `DataFeeds` , which is basically streams of aggregated offchain data onchain. 

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Goerli
     * Aggregator: ETH/USD
     * Address: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
     */
    constructor() {
        priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }
}
```

> The contract has the following components:
> 
> - The `import` line imports an interface named `AggregatorV3Interface`. Interfaces define functions without their implementation, which leaves inheriting contracts to define the actual implementation themselves. In this case, `AggregatorV3Interface` defines that all v3 Aggregators have the function `latestRoundData`. You can [see the complete code](https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol) for the `AggregatorV3Interface` on GitHub.
> - The `constructor() {}` initializes an interface object named `priceFeed` that uses `AggregatorV3Interface` and connects specifically to a proxy aggregator contract that is already deployed at `0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e`. The interface allows your contract to run functions on that deployed aggregator contract.
> - The `getLatestPrice()` function calls your `priceFeed` object and runs the `latestRoundData()` function. When you deploy the contract, it initializes the `priceFeed` object to point to the aggregator at `0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e`, which is the proxy address for the Goerli ETH / USD data feed. Your contract connects to that address and executes the function. The aggregator connects with several oracle nodes and aggregates the pricing data from those nodes. The response from the aggregator includes several variables, but `getLatestPrice()` returns only the `price` variable.

above excerpt was taken from [https://docs.chain.link/docs/consuming-data-feeds/](https://docs.chain.link/docs/consuming-data-feeds/)

While `DataFeeds` (the above use case) is free. The other 3 require payment in LINK tokens. LINK tokens are ERC-667 tokens, i.e they have an extra function `transferAndCall` that allows sending of LINK tokens while also executing some piece of code on the destination contract. 

---

## Reliability:

> On Uniswap the price of manipulation is essentially just the trading fee. (a) it is probably unwise for a contract to depend on small changes in the Uniswap price (which are quite cheap, as shown), and (b) a contract should not depend on the price reported by Uniswap over a very short period of time.  - **Gaunlet on v2 TWAP**
> 

- TWAP’s security is inversely proportional to the latency, i.e its harder to manipulate a TWAP over longer time frame, but this also reduces the sensitivity of the TWAP
- This causes accuracy delays in highly volatile situations, leaving oracle users with stale data
- This is a fundamental flaw in the very nature of TWAP, rather that one isolated to Uniswap
- Chainlink can support any implementation of Weightage. Most price feeds use VWAP- volume weighted average where sensitivity is a function of volume and thus provide a good combination of accuracy and security.
- Chainlink datafeeds also provide the latest un-weighted values, the max and min range; so that the user can customized their contracts to respond to volatile situations specifically.

[https://twitter.com/FloatProtocol/status/1482184042850263042?s=20&t=0u2BaKeFJu13An1LRk_4ug](https://twitter.com/FloatProtocol/status/1482184042850263042?s=20&t=0u2BaKeFJu13An1LRk_4ug)

Above is an example of Oracle attack via Uniswap Price manipulation.  Euler Finance at the start of the year open sourced their Oracle attack simulator - [Link](https://blog.euler.finance/uniswap-oracle-attack-simulator-42d18adf65af). From the analysis, we can notice that,  Funds required to manipulate a TWAP is a function of the liquidity profile. However,  irrespective of the Pool Liquidity, A 30-min TWAP can’t be pushed beyond +100% or -50% in a single block. 

Uniswap v3 is best used as a Price Index oracle for highly liquid pairs or a substitute for Chainlink, where datafeeds of certain tokens don’t exist. 

---

## Sustainability

> Using the ETH/USDC price as a proxy for ETH/USD does not achieve that goal, because the such a system is still ultimately dependent on USDC continuing to exist and being freely tradeable. -**Vitalik**
> 

- Uniswap is only a price index TWAP for Uniswap v3 Pools.
- Chainlink on the other hand is a pure oracle, relaying offchain data of any kind into the blockchain.
- As Chainlink uses a PoS system of data input and validation, incentives play a major role in sustainability.
- Incentives are a function of the demand for the data (thus fee generated) as well as LINK price action.
- In terms of initial cost of setup for a feed that doesn’t exist, Uniswap is as easy as deploying a liquidity pool. whereas for Chainlink, its an expensive deployment for multiple contracts that `request`, `validate` and `relay` data from a `decentralized` subset of node. Atleast one contract for each of these keywords.
- Moreover, data from Chainlink is relayed from outside, via APIs. The existence of such an API is also vital, as that adds extra overhead
- This means, Chainlink is prone to external factors, like API pricing, API accessibility (server downtimes)
- Uniswap exists, internally on the blockchain and thus is free from such external factors.
- Moreover, maintenance of the sanctity of the price feed from Uniswap is performed by arbitrageurs, resulting in almost zero expense once setup (excluding the cost of maintaining the liquidity)
- Uniswap’s TWAP security is highly reliant on the Pool Liquidity - as seen above using the Euler Finance Simulator.
- Uniswap’s TWAP, when used,  is only reliable as long as sufficient liquidity profile exists, thus sustainability is a function of liquidity and the cost required to maintain it.
- Its relatively easy for highly liquid pairs like ETH/USDC, to maintain liquidity, however exotic pairs might need Farming rewards to maintain a sustainable liquidity.
- The sustainability is dependant on the Liquidity providers, with fees generated from swaps and LP rewards main factors of sustaining the usability of oracle

---

## Decentralization

- Uniswap’s decentralization is a function of the swap activity.
- Since Uniswap’s implementation is purely onchain, as long as the chain deployed is sufficiently decentralized, the TWAP itself is decentralized.
- This is augmented by the fact that, anyone swapping on Uniswap is adding an extra step of decentralization
- Strong MEV incentives, has created a competition in Arbitrage space, which inturn improves decentralization, as failure of one arbitrageur to rectify the stale price, will be immediately pounced upon by others
- With 9000 active nodes ([Etherscan source](https://etherscan.io/nodetracker)) and 9000 active MEV searchers ([FlashBots source](https://etherscan.io/nodetracker)), Uniswap’s decentralization is top-notch.
- ChainLink data is a weighted function of input data from nodes which are `decentralized trusted network`
- Trusting that the network underneath is decentralized,  is a main factor
- Moreover, There are only around 300 nodes operating ([Chainlink source](https://market.link/overview)). This is minuscule compared to Ethereum mainnet validators.

---

## Scalability

> the calling contract may cheaply construct a time-weighted average over any arbitrary range inside of (or fully encompassing) the length of the oracle array - **Uniswap v3 docs**
> 
- In terms of blockchain support, Uniswap supports only 4 blockchains (Optimism excluded), where as Chainlink supports 14 EVM chains. This allows easy implementation of the same contract, across multiple chains easier.
- Expanding from one-oracle to multiple oracles is also comparable. ‘
- For Uniswap, we simply change the Pool Address passed or the token passed.
- For Chainlink, only Aggregator contract varies.
- This means, both oracles can be encapsulated in a function that receives the feeder contract as parameters.
- The original price feeds of Uniswap are slightly more versatile as they provide historical TWAP ticks and allow flexibility in terms of TWAP sensitivity
- Chainlink also provide historical price, but when queried, it gives a historical VWAP price. Changes in terms of flexibility in Weightage implementation is done manually while initializing the Aggregator contracts
- Opting from such customization requires LINK payments to run a oracle for the required data in a required format. However, it opens up to fine customization, capable of building any required implementation of weightage.

## Verdict:

- Chainlink is more reliable in terms of data accuracy in volatile environments.
- When volatility is not an issue, Uniswap is a easier to method to build a TWAP for a token
- Chainlink is however, much more customizable when compared to Uniswap, however it comes with increased complexity and increased maintenance costs
- Uniswap is easily more decentralized as it runs and aggregates data from a blockchain run by 9000 validators, while 9000 monthly active MEV searchers keep validating the price. Chainlink only has around 300 Validators
- Chainlink has support for more blockchains than Uniswap
- Uniswap doesn’t provide any kind of support for off-chain data or non-TWAP price feeds.

**Do you need the most current price at expense of being sensitive to price spikes? Or do you prioritize the weighted average over precision?**

Answering this question should solve the dilemma. 

If accuracy is important, eg. Liquidation contracts, Algo rebalancing contract; then Chainlink is the way to go. Want a averaged, un-manipulated price, eg. Price action betting or Perps; then Uniswap is a simple.

Say you don’t want a TWAP, and need a better weightage system, Chainlink provides the customization, provided you can pay for the feature. 

Ideally, most projects use Chainlink if a price feed link exists for the data required. Uniswap is generally used as a fallback. Mean Finance is an example of this.

## Refs:

- [https://smartcontentpublication.medium.com/twap-oracles-vs-chainlink-price-feeds-a-comparative-analysis-8155a3483cbd](https://smartcontentpublication.medium.com/twap-oracles-vs-chainlink-price-feeds-a-comparative-analysis-8155a3483cbd)
- [https://medium.com/gauntlet-networks/why-is-uniswap-a-good-oracle-22d84e5b0b6c](https://medium.com/gauntlet-networks/why-is-uniswap-a-good-oracle-22d84e5b0b6c)
- [https://docs.uniswap.org/protocol/concepts/V3-overview/oracle](https://docs.uniswap.org/protocol/concepts/V3-overview/oracle)
- [https://blog.euler.finance/uniswap-oracle-attack-simulator-42d18adf65af](https://blog.euler.finance/uniswap-oracle-attack-simulator-42d18adf65af)
- [https://chaoslabs.xyz/posts/chaos-labs-uniswap-v3-twap-deep-dive-pt-1](https://chaoslabs.xyz/posts/chaos-labs-uniswap-v3-twap-deep-dive-pt-1)
- [https://docs.chain.link/docs](https://docs.chain.link/docs/get-the-latest-price/)
