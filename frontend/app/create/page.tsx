"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { factoryContract } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function CreateMarketPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question || !description || !resolutionDate) {
      toast.error("Missing fields", {
        description: "Please fill in all fields",
      });
      return;
    }

    // Convert date to Unix timestamp
    const timestamp = Math.floor(new Date(resolutionDate).getTime() / 1000);
    
    // Check if date is in the future
    if (timestamp <= Math.floor(Date.now() / 1000)) {
      toast.error("Invalid date", {
        description: "Resolution date must be in the future",
      });
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract: factoryContract,
        method: "function createMarket(string question, string description, uint256 resolutionTime) returns (address)",
        params: [question, description, BigInt(timestamp)],
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Market created!", {
            description: "Your prediction market is now live",
          });
          router.push("/");
        },
        onError: (error) => {
          if (error.message?.includes("User rejected") || 
              error.message?.includes("closed modal")) {
            return;
          }
          console.error("Failed to create market:", error);
          toast.error("Creation failed", {
            description: "Please try again",
          });
        },
      });
    } catch (error) {
      console.error("Error preparing transaction:", error);
      toast.error("Error", {
        description: "Failed to prepare transaction",
      });
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">Please connect your wallet to create a market</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Create Prediction Market
        </h1>
        <p className="text-slate-600">
          Create a new market for others to predict on
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Details</CardTitle>
          <CardDescription>
            Provide information about the prediction you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                placeholder="Will Bitcoin reach $100,000 by end of 2025?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-slate-500">
                {question.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the market conditions, resolution criteria, and any important details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={500}
                required
              />
              <p className="text-xs text-slate-500">
                {description.length}/500 characters
              </p>
            </div>

            {/* Resolution Date */}
            <div className="space-y-2">
              <Label htmlFor="resolutionDate">
                Resolution Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="resolutionDate"
                  type="datetime-local"
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                When can this market be resolved? Must be in the future.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>You will be the market creator and resolver</li>
                <li>Users will bet YES or NO using ETH</li>
                <li>Simple 1:1 pricing (1 ETH = 1 share)</li>
                <li>After resolution date, only you can resolve the market</li>
                <li>Winners split the total pool proportionally</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Market
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}