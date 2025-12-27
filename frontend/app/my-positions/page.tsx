"use client";

import { useReadContract, useActiveAccount } from "thirdweb/react";
import { factoryContract, getMarketContract } from "@/lib/contracts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { MarketState, Outcome } from "@/types";

const ZERO = BigInt(0);
export default function MyPositionsPage() {
  const account = useActiveAccount();

  // Fetch all markets
  const { data: marketCount } = useReadContract({
    contract: factoryContract,
    method: "function getMarketCount() view returns (uint256)",
  });

  const { data: marketAddresses, isLoading } = useReadContract({
    contract: factoryContract,
    method: "function getLatestMarkets(uint256 count) view returns (address[])",
    params: [marketCount || BigInt(0)],
  });

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Please connect your wallet to view your positions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Positions
        </h1>
        <p className="text-slate-600">
          Track all your active and resolved market positions
        </p>
      </div>

      {/* Markets with positions */}
      <div className="space-y-4">
        {!marketAddresses || marketAddresses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No markets found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          marketAddresses.map((address) => (
            <PositionCard key={address} marketAddress={address} userAddress={account.address} />
          ))
        )}
      </div>
    </div>
  );
}

function PositionCard({ marketAddress, userAddress }: { marketAddress: string; userAddress: string }) {
  const contract = getMarketContract(marketAddress);

  // Fetch market data
  const { data: question } = useReadContract({
    contract,
    method: "function question() view returns (string)",
  });

  const { data: state } = useReadContract({
    contract,
    method: "function state() view returns (uint8)",
  });

  const { data: outcome } = useReadContract({
    contract,
    method: "function outcome() view returns (uint8)",
  });

  const { data: userPosition } = useReadContract({
    contract,
    method: "function getUserPosition(address user) view returns (uint256 yes, uint256 no)",
    params: [userAddress],
  });

  const { data: yesProbability } = useReadContract({
    contract,
    method: "function getYesProbability() view returns (uint256)",
  });

  const { data: totalPool } = useReadContract({
    contract,
    method: "function getTotalPool() view returns (uint256)",
  });

  const { data: totalYesShares } = useReadContract({
    contract,
    method: "function totalYesShares() view returns (uint256)",
  });

  const { data: totalNoShares } = useReadContract({
    contract,
    method: "function totalNoShares() view returns (uint256)",
  });

  // Don't show if user has no position
  if (!userPosition || (userPosition[0] === ZERO && userPosition[1] === ZERO)) {
    return null;
  }

  const [yesShares, noShares] = userPosition;
  const hasYesShares = yesShares > ZERO;
  const hasNoShares = noShares > ZERO;
  const marketState = state as MarketState;
  const marketOutcome = outcome as Outcome;

  // Calculate potential winnings
  const calculatePotentialWinnings = () => {
    if (!totalPool || !totalYesShares || !totalNoShares) return "0";
    
    if (marketState === MarketState.Resolved) {
      if (marketOutcome === Outcome.Yes && hasYesShares) {
        const winnings = (totalPool * yesShares) / totalYesShares;
        return formatEther(winnings).slice(0, 8);
      }
      if (marketOutcome === Outcome.No && hasNoShares) {
        const winnings = (totalPool * noShares) / totalNoShares;
        return formatEther(winnings).slice(0, 8);
      }
      if (marketOutcome === Outcome.Invalid) {
        return formatEther(yesShares + noShares).slice(0, 8);
      }
      return "0";
    }
    
    // For active markets, show potential if they win
    if (hasYesShares && totalYesShares > ZERO) {
      const potentialWin = (totalPool * yesShares) / totalYesShares;
      return formatEther(potentialWin).slice(0, 8);
    }
    if (hasNoShares && totalNoShares > ZERO) {
      const potentialWin = (totalPool * noShares) / totalNoShares;
      return formatEther(potentialWin).slice(0, 8);
    }
    return "0";
  };

  const getStatusBadge = () => {
    if (marketState === MarketState.Active) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    if (marketState === MarketState.Resolved) {
      const isWinner = 
        (marketOutcome === Outcome.Yes && hasYesShares) ||
        (marketOutcome === Outcome.No && hasNoShares) ||
        marketOutcome === Outcome.Invalid;
      
      if (isWinner) {
        return <Badge className="bg-blue-500">Won - Can Claim</Badge>;
      }
      return <Badge variant="outline" className="bg-slate-100">Lost</Badge>;
    }
    return <Badge variant="outline">Cancelled</Badge>;
  };

  const yesPercent = yesProbability ? Number(yesProbability) : 50;
  const totalInvested = formatEther(yesShares + noShares).slice(0, 8);
  const potentialWinnings = calculatePotentialWinnings();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{question || "Loading..."}</h3>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position Details */}
        <div className="grid grid-cols-2 gap-4">
          {hasYesShares && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">YES Position</p>
              <p className="text-lg font-bold text-blue-700">
                {formatEther(yesShares).slice(0, 6)} ETH
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {yesPercent}% probability
              </p>
            </div>
          )}
          {hasNoShares && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600 font-medium mb-1">NO Position</p>
              <p className="text-lg font-bold text-red-700">
                {formatEther(noShares).slice(0, 6)} ETH
              </p>
              <p className="text-xs text-red-600 mt-1">
                {100 - yesPercent}% probability
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">Invested</p>
            <p className="font-semibold">{totalInvested} ETH</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">
              {marketState === MarketState.Resolved ? "Winnings" : "If Win"}
            </p>
            <p className="font-semibold text-green-600">{potentialWinnings} ETH</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Total Pool</p>
            <p className="font-semibold">
              {totalPool ? formatEther(totalPool).slice(0, 6) : "0"} ETH
            </p>
          </div>
        </div>

        {/* Market Link */}
        <div className="border-t pt-4">
          <a
            href={`/?market=${marketAddress}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Market Details →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}