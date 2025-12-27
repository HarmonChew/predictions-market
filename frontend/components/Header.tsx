"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import { sepolia } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prediction Market
              </h1>
              <p className="text-xs text-slate-500">Bet on the future</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Markets
            </Link>
            <Link 
              href="/my-positions" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              My Positions
            </Link>
            <Link 
              href="/create" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Create Market
            </Link>
          </nav>

          <ConnectButton
            client={client}
            chain={sepolia}
            connectButton={{
              label: "Sign In",
            }}
            wallets={[inAppWallet()]}
            accountAbstraction={{
              chain: sepolia,
              sponsorGas: true,
            }}
          />
        </div>
      </div>
    </header>
  );
}