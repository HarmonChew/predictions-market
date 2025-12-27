"use client";

import { useReadContract, useActiveAccount } from "thirdweb/react";
import { getMarketContract } from "@/lib/contracts";
import { MarketState, Outcome } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Users } from "lucide-react";
import { formatEther } from "viem";
import { useState } from "react";
import { BuySharesModal } from "./BuySharesModal";
import { ClaimModal } from "./ClaimModal";
import { ResolveModal } from "./ResolveModal";

interface MarketCardProps {
  marketAddress: string;
  filter: "all" | "active" | "resolved";
}

const ZERO = BigInt(0);

export function MarketCard({ marketAddress, filter }: MarketCardProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const account = useActiveAccount();
  const contract = getMarketContract(marketAddress);

  // Fetch market data
  const { data: question } = useReadContract({
    contract,
    method: "function question() view returns (string)",
  });

  const { data: description } = useReadContract({
    contract,
    method: "function description() view returns (string)",
  });

  const { data: state } = useReadContract({
    contract,
    method: "function state() view returns (uint8)",
  });

  const { data: outcome } = useReadContract({
    contract,
    method: "function outcome() view returns (uint8)",
  });

  const { data: creator } = useReadContract({
    contract,
    method: "function creator() view returns (address)",
  });

  const { data: resolutionTime } = useReadContract({
    contract,
    method: "function resolutionTime() view returns (uint256)",
  });

  const { data: totalYesShares } = useReadContract({
    contract,
    method: "function totalYesShares() view returns (uint256)",
  });

  const { data: totalNoShares } = useReadContract({
    contract,
    method: "function totalNoShares() view returns (uint256)",
  });

  const { data: yesProbability } = useReadContract({
    contract,
    method: "function getYesProbability() view returns (uint256)",
  });

  const { data: totalPool } = useReadContract({
    contract,
    method: "function getTotalPool() view returns (uint256)",
  });

  const { data: userPosition } = useReadContract({
    contract,
    method: "function getUserPosition(address user) view returns (uint256 yes, uint256 no)",
    params: [account?.address as string],
    queryOptions: {
      enabled: !!account?.address,
    },
  });

  // Filter logic
  const marketState = state as MarketState;
  if (filter === "active" && marketState !== MarketState.Active) return null;
  if (filter === "resolved" && marketState !== MarketState.Resolved) return null;

  // Format time remaining
  const getTimeRemaining = () => {
    if (!resolutionTime) return "Loading...";
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(resolutionTime) - now;
    
    if (diff < 0) return "Expired";
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  // Get state badge
  const getStateBadge = () => {
    if (marketState === MarketState.Active) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    if (marketState === MarketState.Resolved) {
      const outcomeValue = outcome as Outcome;
      if (outcomeValue === Outcome.Yes) return <Badge className="bg-blue-500">Resolved: YES</Badge>;
      if (outcomeValue === Outcome.No) return <Badge className="bg-red-500">Resolved: NO</Badge>;
      if (outcomeValue === Outcome.Invalid) return <Badge className="bg-gray-500">Invalid</Badge>;
    }
    if (marketState === MarketState.Cancelled) {
      return <Badge variant="outline">Cancelled</Badge>;
    }
    return <Badge>Unknown</Badge>;
  };

  const yesPercent = yesProbability ? Number(yesProbability) : 50;
  const noPercent = 100 - yesPercent;

  const hasPosition = userPosition && (userPosition[0] > ZERO || userPosition[1] > ZERO);
  const isCreator = account?.address?.toLowerCase() === creator?.toLowerCase();
  const canResolve = isCreator && marketState === MarketState.Active && resolutionTime && Number(resolutionTime) <= Math.floor(Date.now() / 1000);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            {getStateBadge()}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {getTimeRemaining()}
            </div>
          </div>
          <h3 className="font-semibold text-lg leading-tight">{question || "Loading..."}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{description || ""}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Probability bars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-600">YES</span>
              <span className="font-bold text-blue-600">{yesPercent}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${yesPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <span className="font-medium text-red-600">NO</span>
              <span className="font-bold text-red-600">{noPercent}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                style={{ width: `${noPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Pool</p>
              <p className="font-semibold text-sm">
                {totalPool ? `${formatEther(totalPool).slice(0, 6)} ETH` : "0 ETH"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Participants</p>
              <p className="font-semibold text-sm flex items-center gap-1">
                <Users className="w-3 h-3" />
                {/* This would need event tracking for accuracy */}
                ~{((totalYesShares || ZERO) + (totalNoShares || ZERO) > ZERO) ? "Active" : "None"}
              </p>
            </div>
          </div>

          {/* User position */}
          {hasPosition && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs font-medium text-slate-700 mb-2">Your Position</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600">
                  YES: {formatEther(userPosition![0]).slice(0, 6)} ETH
                </span>
                <span className="text-red-600">
                  NO: {formatEther(userPosition![1]).slice(0, 6)} ETH
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {marketState === MarketState.Active ? (
            <>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setShowBuyModal(true)}
                disabled={!account}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy Shares
              </Button>
              {canResolve && (
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => setShowResolveModal(true)}
                >
                  Resolve Market
                </Button>
              )}
            </>
          ) : marketState === MarketState.Resolved && hasPosition ? (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setShowClaimModal(true)}
            >
              Claim Winnings
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      <BuySharesModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        marketAddress={marketAddress}
        question={question || ""}
        yesProbability={yesPercent}
      />

      <ClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        marketAddress={marketAddress}
        question={question || ""}
        outcome={outcome as Outcome}
        yesShares={userPosition?.[0].toString() || "0"}
        noShares={userPosition?.[1].toString() || "0"}
      />

      <ResolveModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        marketAddress={marketAddress}
        question={question || ""}
      />
    </>
  );
}