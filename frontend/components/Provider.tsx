"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}