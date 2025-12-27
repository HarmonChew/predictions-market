"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, AlertCircle, Ban } from "lucide-react";
import { toast } from "sonner";

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketAddress: string;
  question: string;
}

export function ResolveModal({
  isOpen,
  onClose,
  marketAddress,
  question,
}: ResolveModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const contract = getMarketContract(marketAddress);

  const handleResolve = async () => {
    if (selectedOutcome === null || selectedOutcome === Outcome.Unresolved) {
      toast.error("Please select an outcome");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method: "function resolve(uint8 _outcome)",
        params: [selectedOutcome],
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          const outcomeName = selectedOutcome === Outcome.Yes ? "YES" : 
                             selectedOutcome === Outcome.No ? "NO" : "INVALID";
          toast.success("Market resolved!", {
            description: `Market resolved as ${outcomeName}. Winners can now claim.`,
          });
          onClose();
          setSelectedOutcome(null);
        },
        onError: (error) => {
          if (error.message?.includes("User rejected") || 
              error.message?.includes("closed modal")) {
            return;
          }
          console.error("Resolution failed:", error);
          toast.error("Resolution failed", {
            description: "Please try again",
          });
        },
      });
    } catch (error) {
      console.error("Error preparing resolution:", error);
      toast.error("Error", {
        description: "Failed to prepare transaction",
      });
    }
  };

  const outcomes = [
    {
      value: Outcome.Yes,
      label: "YES",
      description: "The prediction came true",
      icon: CheckCircle,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      selectedBg: "bg-blue-100",
      selectedBorder: "border-blue-500",
    },
    {
      value: Outcome.No,
      label: "NO",
      description: "The prediction did not come true",
      icon: XCircle,
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      selectedBg: "bg-red-100",
      selectedBorder: "border-red-500",
    },
    {
      value: Outcome.Invalid,
      label: "INVALID",
      description: "The market is invalid, refund everyone",
      icon: AlertCircle,
      color: "gray",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      selectedBg: "bg-gray-100",
      selectedBorder: "border-gray-500",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-orange-500" />
            Resolve Market
          </DialogTitle>
          <DialogDescription className="text-sm pt-2">
            {question}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900 font-medium mb-1">
              ⚠️ This action is irreversible
            </p>
            <p className="text-xs text-orange-700">
              Once resolved, users can claim their winnings based on your decision.
              Choose carefully as this cannot be undone.
            </p>
          </div>

          {/* Outcome Selection */}
          <div className="space-y-2">
            <Label>Select Outcome</Label>
            <div className="space-y-2">
              {outcomes.map((outcome) => {
                const Icon = outcome.icon;
                const isSelected = selectedOutcome === outcome.value;
                
                return (
                  <button
                    key={outcome.value}
                    type="button"
                    onClick={() => setSelectedOutcome(outcome.value)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? `${outcome.selectedBg} ${outcome.selectedBorder}` 
                        : `${outcome.bgColor} ${outcome.borderColor} hover:border-${outcome.color}-300`
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${outcome.textColor}`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${outcome.textColor} mb-1`}>
                          {outcome.label}
                        </p>
                        <p className="text-sm text-slate-600">
                          {outcome.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className={`w-5 h-5 rounded-full ${outcome.textColor} flex items-center justify-center`}>
                          <div className="w-3 h-3 bg-current rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirmation */}
          {selectedOutcome !== null && selectedOutcome !== Outcome.Unresolved && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                You are resolving this market as:{" "}
                <span className="font-bold">
                  {outcomes.find(o => o.value === selectedOutcome)?.label}
                </span>
              </p>
              <p className="text-xs text-slate-600">
                {selectedOutcome === Outcome.Yes && "Users who bet YES will be able to claim their share of the pool."}
                {selectedOutcome === Outcome.No && "Users who bet NO will be able to claim their share of the pool."}
                {selectedOutcome === Outcome.Invalid && "All users will be refunded their original bet amount."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={!selectedOutcome || isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              "Confirm Resolution"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}