"use client";

import { useViewMode } from "@/src/contexts/ViewModeContext";
import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const { viewMode } = useViewMode();
  const isSolanaMode = viewMode === "solanascan";
  const currentPath = usePathname();
  const isHomePage = currentPath === "/";
  
  return (
    <main className={`mx-auto ${isSolanaMode ? isHomePage ? "-mt-14" : "" : "pt-8"} pb-20`}>
      {children}
    </main>
  );
}

