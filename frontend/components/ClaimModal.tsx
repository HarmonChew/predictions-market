"use client";

import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getMarketContract } from "@/lib/contracts";
import { Outcome } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, AlertCircle } from "lucide-react";
import { formatEther } from "viem";
import { toast } from "sonner";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketAddress: string;
  question: string;
  outcome: Outcome;
  yesShares: string;
  noShares: string;
}

export function ClaimModal({
  isOpen,
  onClose,
  marketAddress,
  question,
  outcome,
  yesShares,
  noShares,
}: ClaimModalProps) {
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const contract = getMarketContract(marketAddress);
  const ZERO = BigInt(0);

  const handleClaim = async () => {
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function claim()",
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Winnings claimed!", {
            description: "Your funds have been transferred to your wallet",
          });
          onClose();
        },
        onError: (error) => {
          // Don't log if user just rejected/closed the modal
          if (error.message?.includes("User rejected") || 
              error.message?.includes("closed modal")) {
            return;
          }
          console.error("Claim failed:", error);
          toast.error("Claim failed", {
            description: "Please try again",
          });
        },
      });
    } catch (error) {
      console.error("Error preparing claim:", error);
    }
  };

  const yesSharesBigInt = BigInt(yesShares);
  const noSharesBigInt = BigInt(noShares);
  const hasYesShares = yesSharesBigInt > ZERO;
  const hasNoShares = noSharesBigInt > ZERO;

  // Check if user won
  const isWinner =
    (outcome === Outcome.Yes && hasYesShares) ||
    (outcome === Outcome.No && hasNoShares) ||
    outcome === Outcome.Invalid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isWinner ? (
              <>
                <Trophy className="w-5 h-5 text-yellow-500" />
                Claim Your Winnings!
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-slate-500" />
                Market Resolved
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm pt-2">
            {question}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Outcome badge */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Final Outcome</p>
            <div className="flex items-center gap-2">
              {outcome === Outcome.Yes && (
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  YES
                </div>
              )}
              {outcome === Outcome.No && (
                <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  NO
                </div>
              )}
              {outcome === Outcome.Invalid && (
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  INVALID (Refund)
                </div>
              )}
            </div>
          </div>

          {/* User's position */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Your Position</p>
            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
              {hasYesShares && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 font-medium">YES Shares</span>
                  <span className="text-sm font-semibold">
                    {formatEther(yesSharesBigInt).slice(0, 8)} ETH
                  </span>
                </div>
              )}
              {hasNoShares && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 font-medium">NO Shares</span>
                  <span className="text-sm font-semibold">
                    {formatEther(noSharesBigInt).slice(0, 8)} ETH
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Result message */}
          {isWinner ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-medium">
                🎉 Congratulations! You predicted correctly.
              </p>
              <p className="text-xs text-green-700 mt-1">
                Click below to claim your proportional share of the total pool.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                Unfortunately, your prediction was incorrect. Better luck next time!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Close
          </Button>
          {isWinner && (
            <Button
              onClick={handleClaim}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim Winnings"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}