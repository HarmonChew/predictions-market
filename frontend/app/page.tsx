"use client";

import { useState } from "react";
import { useReadContract } from "thirdweb/react";
import { factoryContract } from "@/lib/contracts";
import { FACTORY_ABI } from "@/lib/abis";
import { MarketCard } from "@/components/MarketCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  // Fetch total market count
  const { data: marketCount, isLoading } = useReadContract({
    contract: factoryContract,
    method: "function getMarketCount() view returns (uint256)",
  });

  // Fetch all market addresses
  const { data: marketAddresses } = useReadContract({
    contract: factoryContract,
    method: "function getLatestMarkets(uint256 count) view returns (address[])",
    params: [marketCount || BigInt(0)],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Predict the Future
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Bet on real-world events and earn from accurate predictions. Transparent, decentralized, and secure.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Markets</p>
          <p className="text-3xl font-bold text-slate-900">
            {marketCount?.toString() || "0"}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Active Markets</p>
          <p className="text-3xl font-bold text-blue-600">
            {marketAddresses?.length || "0"}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Network</p>
          <p className="text-3xl font-bold text-purple-600">Sepolia</p>
        </div>
      </div>

      {/* Markets */}
      <Tabs defaultValue="active" onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All Markets</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {!marketAddresses || marketAddresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No markets found. Create the first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketAddresses.map((address) => (
                <MarketCard
                  key={address}
                  marketAddress={address}
                  filter={filter}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}