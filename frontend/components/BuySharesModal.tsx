"use client";

import { useState } from "react";
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getMarketContract } from "@/lib/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { parseEther } from "viem";
import { toast } from "sonner";

interface BuySharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketAddress: string;
  question: string;
  yesProbability: number;
}

export function BuySharesModal({
  isOpen,
  onClose,
  marketAddress,
  question,
  yesProbability,
}: BuySharesModalProps) {
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const contract = getMarketContract(marketAddress);

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const transaction = prepareContractCall({
        contract,
        method: "function buyShares(bool isYes) payable",
        params: [selectedOption === "yes"],
        value: parseEther(amount),
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Shares purchased!", {
            description: `You bought ${amount} ${selectedOption.toUpperCase()} shares`,
          });
          onClose();
          setAmount("");
        },
        onError: (error) => {
          // Don't log if user just rejected/closed the modal
          if (error.message?.includes("User rejected") || 
              error.message?.includes("closed modal")) {
            return;
          }
          console.error("Transaction failed:", error);
          toast.error("Transaction failed", {
            description: "Please try again",
          });
        },
      });
    } catch (error) {
      console.error("Error preparing transaction:", error);
    }
  };

  const noProbability = 100 - yesProbability;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Shares</DialogTitle>
          <DialogDescription className="text-sm pt-2">
            {question}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedOption} onValueChange={(v) => setSelectedOption(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="yes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              YES ({yesProbability}%)
            </TabsTrigger>
            <TabsTrigger value="no" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <TrendingDown className="w-4 h-4 mr-2" />
              NO ({noProbability}%)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yes" className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                You're betting that this prediction will be <span className="font-bold">YES</span>.
                Current probability: <span className="font-bold">{yesProbability}%</span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="no" className="space-y-4 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                You're betting that this prediction will be <span className="font-bold">NO</span>.
                Current probability: <span className="font-bold">{noProbability}%</span>
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 pt-2">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            1 ETH = 1 Share. You'll receive {amount || "0"} shares.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-slate-600">You pay:</span>
            <span className="font-semibold">{amount || "0"} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">You receive:</span>
            <span className="font-semibold">{amount || "0"} shares</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleBuy}
            disabled={!amount || parseFloat(amount) <= 0 || isPending}
            className={
              selectedOption === "yes"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Buying...
              </>
            ) : (
              `Buy ${selectedOption.toUpperCase()} Shares`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}