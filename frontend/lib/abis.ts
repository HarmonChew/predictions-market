// ABI definitions for our contracts

export const FACTORY_ABI = [
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "question", type: "string" },
      { name: "description", type: "string" },
      { name: "resolutionTime", type: "uint256" },
    ],
    outputs: [{ name: "marketAddress", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMarketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestMarkets",
    inputs: [{ name: "count", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
] as const;

export const MARKET_ABI = [
  {
    type: "function",
    name: "question",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "description",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "state",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "outcome",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "resolutionTime",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalYesShares",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalNoShares",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getYesProbability",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalPool",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserPosition",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "yes", type: "uint256" },
      { name: "no", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buyShares",
    inputs: [{ name: "isYes", type: "bool" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "claim",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;