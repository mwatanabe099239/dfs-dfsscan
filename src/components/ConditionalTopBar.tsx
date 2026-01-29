"use client";

import { useViewMode } from "@/src/contexts/ViewModeContext";
import TopBar from "./TopBar";

export default function ConditionalTopBar() {
  const { viewMode } = useViewMode();
  
  if (viewMode === "solanascan") {
    return null;
  }
  
  return <TopBar />;
}

