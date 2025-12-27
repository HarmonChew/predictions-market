import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prediction Market",
  description: "Decentralized prediction markets on Ethereum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}