export enum MarketState {
  Active = 0,
  Resolved = 1,
  Cancelled = 2,
}

export enum Outcome {
  Unresolved = 0,
  Yes = 1,
  No = 2,
  Invalid = 3,
}

export interface Market {
  address: string;
  question: string;
  description: string;
  creator: string;
  resolutionTime: bigint;
  createdAt: bigint;
  state: MarketState;
  outcome: Outcome;
  totalYesShares: bigint;
  totalNoShares: bigint;
  yesProbability: number;
  totalPool: bigint;
}

export interface UserPosition {
  yesShares: bigint;
  noShares: bigint;
}