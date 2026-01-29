"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ViewMode = "bscscan" | "solanascan";

interface ViewModeContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
  isReady: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined
);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  // Initialize state by reading from localStorage synchronously (client-side only)
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("viewMode") as ViewMode;
      if (savedMode === "bscscan" || savedMode === "solanascan") {
        return savedMode;
      }
    }
    return "bscscan";
  });

  // Mark as ready after mount to prevent flash
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Save to localStorage when mode changes
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem("viewMode", mode);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "bscscan" ? "solanascan" : "bscscan");
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, toggleViewMode, setViewMode, isReady }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}

