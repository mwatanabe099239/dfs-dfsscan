"use client";

import { useViewMode } from "@/src/contexts/ViewModeContext";
import SkeletonLoading from "./SkeletonLoading";

export default function ViewModeWrapper({ children }: { children: React.ReactNode }) {
  const { isReady } = useViewMode();

  if (!isReady) {
    return <SkeletonLoading />;
  }

  return <>{children}</>;
}




