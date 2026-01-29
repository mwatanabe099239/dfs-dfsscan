"use client";

import Image from "next/image";
import TopSearchBar from "./TopSearchBar";
import { usePathname } from "next/navigation";
import { useDfsTokenPrice } from "../hooks/useDfsTokenPrice";
import { RowSkeleton } from "./common/ItemSkeleton";
import { formatNumber } from "../lib/utils";
import { useViewMode } from "@/src/contexts/ViewModeContext";

export default function TopBar() {
  const currentPath = usePathname();
  const isHome = currentPath === "/";
  const { viewMode } = useViewMode();

  const { data, loading } = useDfsTokenPrice();

  const isSolanaMode = viewMode === "solanascan";

  return (
    <div
      className={`${isSolanaMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b z-10 ${
        isHome ? "md:block hidden" : "block"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex md:justify-between justify-center items-center px-4 py-2">
          {/* Left section */}
          <div className="md:block hidden">
            <div className="flex items-center gap-3 text-xs">
              <button className={`text-xs border rounded-md p-1 ${
                isSolanaMode 
                  ? "text-gray-300 hover:text-white border-gray-600" 
                  : "text-black hover:text-[#0784c3] border-gray-300"
              }`}>
                DFS WEBNET
              </button>
              <span className={`flex items-center gap-1 ${isSolanaMode ? "text-gray-300" : "text-gray-600"}`}>
                DFS Price:{" "}
                <span className={isSolanaMode ? "text-white" : "text-[#0784c3]"}>
                  {loading ? (
                    <RowSkeleton className="h-3" />
                  ) : (
                    `$${formatNumber(data.priceData?.priceUsd || 0, 4)}`
                  )}
                </span>
              </span>
              <span className={`flex items-center gap-1 ${isSolanaMode ? "text-gray-300" : "text-gray-600"}`}>
                Gas:{" "}
                <span className={isSolanaMode ? "text-white" : "text-[#0784c3]"}>
                  {loading ? (
                    <RowSkeleton className="h-3" />
                  ) : (
                    `${formatNumber(data.baseFee || 0, 4)} DFS`
                  )}
                </span>
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3 md:w-auto w-full">
            {isHome ? <></> : <TopSearchBar />}
            {!isSolanaMode && (
              <Image
                src="/dfs-logo-black.png"
                alt="DFS Logo"
                className="mt-1 md:block hidden"
                width={20}
                height={20}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
