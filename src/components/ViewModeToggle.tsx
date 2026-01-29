"use client";

import { useViewMode } from "@/src/contexts/ViewModeContext";
import Image from "next/image";

export default function ViewModeToggle({ compact = false }: { compact?: boolean }) {
  const { viewMode, toggleViewMode } = useViewMode();

  if (compact) {
    return (
      <button
        onClick={toggleViewMode}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          viewMode === "solanascan" ? "bg-gray-600" : "bg-gray-300"
        }`}
        aria-label="Toggle view mode"
        type="button"
        title={viewMode === "bscscan" ? "Switch to SolanaScan" : "Switch to BSCScan"}
      >
        <span
          className={`inline-flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            viewMode === "solanascan" ? "translate-x-5" : "translate-x-0.5"
          }`}
        >
          {viewMode === "bscscan" ? (
            <Image
              src="/icons/bnb.svg"
              alt="BNB"
              width={14}
              height={14}
              className="w-3.5 h-3.5"
            />
          ) : (
            <Image
              src="/icons/solana.svg"
              alt="Solana"
              width={14}
              height={14}
              className="w-3.5 h-3.5"
            />
          )}
        </span>
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0784c3] focus:ring-offset-1 ${
          viewMode === "solanascan" ? "bg-gray-600" : "bg-gray-300"
        }`}
        aria-label="Toggle view mode"
        type="button"
      >
        <span
          className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            viewMode === "solanascan" ? "translate-x-6" : "translate-x-0.5"
          }`}
        >
          {viewMode === "bscscan" ? (
            <Image
              src="/icons/bnb.svg"
              alt="BNB"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          ) : (
            <Image
              src="/icons/solana.svg"
              alt="Solana"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          )}
        </span>
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

