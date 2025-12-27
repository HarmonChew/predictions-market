import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "./client";

// Contract addresses from deployment
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as string;

// Get factory contract instance
export const factoryContract = getContract({
  client,
  chain: sepolia,
  address: FACTORY_ADDRESS,
});

// Helper to get a specific market contract
export const getMarketContract = (marketAddress: string) => {
  return getContract({
    client,
    chain: sepolia,
    address: marketAddress,
  });
};