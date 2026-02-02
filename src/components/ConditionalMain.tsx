"use client";

import { useViewMode } from "@/src/contexts/ViewModeContext";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const { viewMode } = useViewMode();
  const isSolanaMode = viewMode === "solanascan";
  
  return (
    <main className={`mx-auto ${isSolanaMode ? "pt-0" : "pt-8"} pb-20`}>
      {children}
    </main>
  );
}




