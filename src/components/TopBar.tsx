"use client";

import Image from "next/image";
import TopSearchBar from "./TopSearchBar";
import { usePathname } from "next/navigation";
import { useDfsTokenPrice } from "../hooks/useDfsTokenPrice";
import { RowSkeleton } from "./common/ItemSkeleton";
import { formatNumber } from "../lib/utils";

export default function TopBar() {
  const currentPath = usePathname();
  const isHome = currentPath === "/";

  const { data, loading } = useDfsTokenPrice();

  return (
    <div
      className={`bg-white border-b border-gray-200 z-10 ${
        isHome ? "md:block hidden" : "block"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex md:justify-between justify-center items-center px-4 py-2">
          {/* Left section */}
          <div className="md:block hidden">
            <div className="flex items-center gap-3 text-xs">
              <button className="text-xs text-black hover:text-[#0784c3] border border-gray-300 rounded-md p-1">
                DFS WEBNET
              </button>
              <span className="text-gray-600 flex items-center gap-1">
                DFS Price:{" "}
                <span className="text-[#0784c3]">
                  {loading ? (
                    <RowSkeleton className="h-3" />
                  ) : (
                    `$${formatNumber(data.priceData?.priceUsd || 0, 4)}`
                  )}
                </span>
              </span>
              <span className="text-gray-600 flex items-center gap-1">
                Gas:{" "}
                <span className="text-[#0784c3]">
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
          <div className="flex items-center gap-2 md:w-auto w-full">
            {isHome ? <></> : <TopSearchBar />}
            <Image
              src="/dfs-logo-black.png"
              alt="DFS Logo"
              className="mt-1 md:block hidden"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
