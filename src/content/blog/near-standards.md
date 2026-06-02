---
title: "Even NEAR got standards !!!"
date: 2022-10-22
description: "The goal of the article is to introduce you a little bit to NEAR token data basics. DeFi mostly involves transfer of tokens, so understanding them might just help."
tags: ["near", "defi", "crypto", "standards"]
---

The goal of the article is to introduce you a little bit to NEAR token data basics. DeFi mostly involves transfer of tokens, so understanding them might just help.
Standards on NEAR basically exist as guidelines to adhere to so that a preset template is maintained for common contract types and activities. These make it easier for Developers and Researchers to do what they do without delving deep into contracts.
Remember these are not enforced and developers are free to deviate. However, deviations are recommended only when necessary.

## Example of a well-known standard - ERC-20

When a developer says a given token is an ERC-20 token, i.e deployed with an ERC-20 standard contract, we can make a few baseline assumptions, without having to interact with the contract itself.
Say you are a Frontend Dev or Smart Contract Dev, looking to utilize the token in your project. You can straightaway assume, these functions exist:

- `balanceOf(address)` - A function that returns the token balance of a given address
- `transfer(to, amount)` - A function that can be invoked to transfer a certain amount of tokens to a `to` address.

This mean, without even having a look at the contract, you know what to do to perform a simple token transfer.
Imagine you are a Blockchain Sleuth. Natively all you have is traces to know what's going on in the blockchain. But if a contract is an ERC20 standard contract, you know there is a Transfer event:

- `Transfer (index_topic_1 address from, index_topic_2 address to, uint256 value)` - An event that logs a transfer of a value of token from `from` address to `to` address

As someone going through the logs, you don’t need to understand how the blockchain works to know that there was a transfer of a certain amount of tokens from a certain account to another.
Better yet, this allows you to write code once and scale it across all ERC20-compatible tokens.
This is exactly why we need standards.

## Standards on NEAR

We will focus only on the features of Standards required for an off-chain developer or a researcher. This means some internal functions that are only necessary for smart contract devs won’t be discussed.

1. Events
2. Fungible Tokens
3. Non-Fungible Tokens

## Events

Events are basically logs emitted by contracts when an action occurs on the blockchain. These make it easy and user-readable for anyone trying to decipher what's going on in the blockchain as a transaction is processed.
On NEAR the recommended format is:

```json
EVENT_JSON:{ "standard": "nepXXX", "version": "1.0.0", "event": "xyz_is_triggered", "data": { "triggered_by": "foundation.near" } }
```

The `standard` and `version` help us decode the source type of the event, generally interpreted as the contract type that just emitted the event.
The `event` is an alphanumeric key that's used to name the event that just got triggered. However, there might be more important information that must be exposed to the end users. Hence an optional `data` field is used to furnish more information.

## Fungible Tokens - NEP 144

Fungible tokens are tokens that can be divisible to a degree specified by their decimals. These token contracts require a few standard functionalities like functions to transfer tokens, query balances, and so on. NEP 144 encapsulates multiple previous implementations to a current template for Fungible tokens.

### Function Implementation:

A NEP 144 standard fungible token on NEAR must have the following functions. These functions define the necessary functionality for the Fungible tokens.

- `ft_transfer` - Defines the workflow required for the transfer of tokens

```typescript
function ft_transfer(
  receiver_id: string,
  amount: string,
  memo: string | null,
): void {}
```

- `ft_transfer_call` - Defines the workflow required to transfer tokens with a msg to invoke a trigger on the receiver. This allows the receiving account or contract to start a chain of process.

```typescript
function ft_transfer_call(
  receiver_id: string,
  amount: string,
  memo: string | null,
  msg: string,
): Promise {}
```

- `ft_total_supply` - View function to return the current total supply of token

```typescript
function ft_total_supply(): string {}
```

- `ft_balance_of` - Query the balance of a given user.

```typescript
function ft_balance_of(account_id: string): string {}
```

Other function implementations like `ft_on_transfer` which defines how a receiver contract handles a token transferred to it or `ft_resolve_transfer` which defines fungible transfer finalisation on the blockchain; are ignored for now as these are not necessary for the functioning of a Fungible token.

### Metadata:

Metadata is another important component of a fungible token. The metadata allows storing information of the particular Fungible token and thus differentiating itself from others.
The following is the recommended info to be stored on the blockchain, about the token. This info can be usually queried by calling the `ft_metadata` function on the contract implementation.

```typescript
function ft_metadata(): FungibleTokenMetadata {}

type FungibleTokenMetadata = {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
};
```

Storing this info onchain has its advantage, as it makes it easily queryable onchain. Moreover, since NEAR ensures that the validators are paid to store information too, its not expensive to store data on NEAR, unlike Ethereum, which uses IPFS to store most data.

Events are means of logging activity on the blockchain. We have already seen standards to construct events to be emitted on NEAR. However, NEP-144 provides further guidelines on how to template various related events to a Fungible token.
A fungible token has 3 events. Creation - `mint`; Transfer - `transfer`; Destruction - `burn`

The standard for these events are:

```typescript
interface FtEventLogData {
  standard: "nep141";
  version: "1.0.0";
  event: "ft_mint" | "ft_burn" | "ft_transfer";
  data: FtMintLog[] | FtTransferLog[] | FtBurnLog[];
}
```

- When the token is minted the data will contain `FtMintLog`:

```typescript
interface FtMintLog {
  owner_id: string;
  amount: string;
  memo?: string;
}
```

- When the token is transferred the data will contain `FtTransferLog`:

```typescript
interface FtTransferLog {
  old_owner_id: string;
  new_owner_id: string;
  amount: string;
  memo?: string;
}
```

- When the token is burned the data will contain `FtBurnLog`:

```typescript
interface FtBurnLog {
  owner_id: string;
  amount: string;
  memo?: string;
}
```

## Non-Fungible Tokens

Non-Fungible Tokens or NFTs 👀 are another vital standards to be defined, as they scale from art to important receipt documents of the future. They are indivisible and must be transferred whole. Moreover, since they are significantly more valuable compared to a single unit of Fungible token and the transfers must be much more secure. Hence there are additional levels of security in the form of Approvals, which are further standardised.
The usual, basic functionality and events emitted also have their own guidelines.

One of the most important functionalities of NFTs is ownership. Transfer of ownership generally requires complex agreements between the parties involved. A simple NFT trade of an Art NFT is an oversimplified example of such transfer. However, even such ownership requires approval from the owner and then the receiver can take control of the NFT.
This is vital for NFT marketplaces, as these are avenues for place auctions and forget; where the marketplace handles the rest of the agreement. An owner simply approves the Market that upon an agreed term (agreed price in exchange), they can transfer out the NFT.
This approval logic is implemented on the following functions:

- `nft_approve` - This function allows the user to permit another user or contract to transfer out the NFT. Usually, the msg contains the agreement terms, upon which the NFT can be transferred out. However, the interpretation is coded on the receiving contract as a `nft_on_transfer` function.

```typescript
function nft_approve(
  token_id: TokenId,
  account_id: string,
  msg: string | null,
): void | Promise<any> {}
```

- `nft_revoke` - This function, revokes approval of an NFT made to a certain account. Useful for canceling agreements.

```typescript
function nft_revoke(token_id: string, account_id: string) {}
```

- `nft_revoke_all` - This function, revokes all active approvals of an NFT made to accounts. This would cancel approvals made to all accounts

```typescript
function nft_revoke_all(token_id: string) {}
```

- `nft_is_approved` - This function is used to check the status of approval with an account. Returns `true` if the token is approved to be transferred, `false` if otherwise.

```typescript
function nft_is_approved(
  token_id: string,
  approved_account_id: string,
  approval_id: number | null,
): boolean {}
```

This section deals with the basic transfer functions associated with transferring an NFT. While approvals are necessary, transfers are empowering. These sets of functions allow the owner of the NFT to move them out on their own.

- `nft_token` - Checking if the token exists

```typescript
function nft_token(token_id: string): Token | null {}
```

- `nft_transfer` - Allows the owner to transfer out to the specified NFT

```typescript
function nft_transfer(
  receiver_id: string,
  token_id: string,
  approval_id: number | null,
  memo: string | null,
) {}
```

- `nft_transfer_call` - Defines the logic for transferring out an NFT along with instructions to invoke a trigger on the receiver.

```typescript
function nft_transfer_call(
  receiver_id: string,
  token_id: string,
  approval_id: number | null,
  memo: string | null,
  msg: string,
): Promise {}
```

There are also a few view functions, that are necessary to query information like user balances and total supply.

- `nft_total_supply` - Total supply of NFTs

```typescript
function nft_total_supply(): string {}
```

- `nft_tokens` - Check if the list of tokens from `from_index` to `from_index+limit` exist

```typescript
function nft_tokens(
  from_index: string | null, // default: "0"
  limit: number | null, // default: unlimited (could fail due to gas limit)
): Token[] {}
```

- `nft_supply_for_owner` - Number of NFTs held by a user

```typescript
function nft_supply_for_owner(account_id: string): string {}
```

- `nft_tokens_for_owner` - List of token IDs held by a user

```typescript
function nft_tokens_for_owner(
  account_id: string,
  from_index: string | null, // default: 0
  limit: number | null, // default: unlimited (could fail due to gas limit)
): Token[] {}
```

Similar to a fungible token, NFTs have 3 events. Creation - `mint`; Transfer - `transfer`; Destruction - `burn`

The standard for these events are:

```typescript
interface NftEventLogData {
  standard: "nep171";
  version: "1.0.0";
  event: "nft_mint" | "nft_burn" | "nft_transfer";
  data: NftMintLog[] | NftTransferLog[] | NftBurnLog[];
}
```

- When the token is minted the data will contain `NftMintLog`:

```typescript
interface NftMintLog {
  owner_id: string;
  token_ids: string[];
  memo?: string;
}
```

- When the token is transferred the data will contain `NftTransferLog`:

```typescript
interface NftTransferLog {
  authorized_id?: string;
  old_owner_id: string;
  new_owner_id: string;
  token_ids: string[];
  memo?: string;
}
```

- When the token is burned the data will contain `NftBurnLog`:

```typescript
interface NftBurnLog {
  owner_id: string;
  authorized_id?: string;
  token_ids: string[];
  memo?: string;
}
```

DM me via Discord maybeYonas#7121 or @maybeYonas on Twitter for doubts, clarifications (like you gonna have those), and SQL code(if its analysis might help with your bounties).
