"use client";

import { useViewMode } from "@/src/contexts/ViewModeContext";

export default function ViewModeToggle({ compact = false }: { compact?: boolean }) {
  const { viewMode, toggleViewMode } = useViewMode();

  if (compact) {
    return (
      <button
        onClick={toggleViewMode}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          viewMode === "solanascan" ? "bg-gray-600" : "bg-gray-300"
        }`}
        aria-label="Toggle view mode"
        type="button"
        title={viewMode === "bscscan" ? "Switch to SolanaScan" : "Switch to BSCScan"}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            viewMode === "solanascan" ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md bg-white">
      <span
        className={`text-xs font-medium transition-colors whitespace-nowrap ${
          viewMode === "bscscan" ? "text-[#0784c3] font-semibold" : "text-gray-500"
        }`}
      >
        BSCScan
      </span>
      <button
        onClick={toggleViewMode}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0784c3] focus:ring-offset-1 ${
          viewMode === "solanascan" ? "bg-gray-600" : "bg-gray-300"
        }`}
        aria-label="Toggle view mode"
        type="button"
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            viewMode === "solanascan" ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-xs font-medium transition-colors whitespace-nowrap ${
          viewMode === "solanascan" ? "text-gray-700 font-semibold" : "text-gray-500"
        }`}
      >
        SolanaScan
      </span>
    </div>
  );
}

