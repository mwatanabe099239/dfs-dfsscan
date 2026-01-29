"use client";

import SearchBar from "@/src/components/SearchBar";
import NetworkStatsSection from "@/src/components/home/NetworkStats";
import SolanaStatsSection from "@/src/components/home/SolanaStatsSection";
import LatestBlocks from "@/src/components/home/LatestBlocks";
import LatestTransactions from "@/src/components/home/LatestTransactions";
import SolscanTable from "@/src/components/home/SolscanTable";
import TokenDashboard from "@/src/components/home/TokenDashboard";
import AnimatedHeader from "@/src/components/home/AnimatedHeader";
import Image from "next/image";
import { useViewMode } from "@/src/contexts/ViewModeContext";

export default function Home() {
  const { viewMode } = useViewMode();
  const isSolanaMode = viewMode === "solanascan";

  return (
    <>
      {isSolanaMode ? (
        <AnimatedHeader />
      ) : (
        <div className="py-16 -mt-8 bg-[url('/icons/waves-light.svg')] w-full h-[280px] bg-[#131313] bg-repeat">
          <div className="container mx-auto px-4 flex justify-between ">
            <div className="w-full md:w-2/3">
              <div className="text-left mb-2">
                <h1 className="text-xl mb-1 font-bold text-white">
                  DFS Web Chain Explorer
                </h1>
              </div>
              <SearchBar />
              <div className="text-base mt-3 text-gray-300">
                <span className="font-semibold">Sponsored: </span>
                Advertise across our explorers and boost your visibility.{" "}
                <span className="text-[#0784c3] cursor-pointer">
                  Book your slot here!
                </span>
              </div>
            </div>
            <div className="w-1/3 md:block hidden ">
              <div className="flex items-center justify-start">
                <div className="w-fit relative md:block hidden">
                  <div className="absolute -top-2 right-5 bg-white text-black px-2 py-1 text-xs rounded-md">
                    Ad
                  </div>
                  <Image
                    src="/images/ads.png"
                    alt="DFS Logo"
                    className="h-auto object-contain rounded-lg cursor-pointer"
                    width={350}
                    height={100}
                    priority
                    onClick={() => {
                      window.open("https://quickido.com", "_blank");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 container mx-auto">
        <div className={`${isSolanaMode ? "bg-transparent py-0 " : "bg-white py-4 md:px-1 px-4 shadow-md "} rounded-lg mb-6   ${isSolanaMode ? "mt-[20px]" : "mt-[-30px]"}`}>
          {isSolanaMode ? <SolanaStatsSection /> : <NetworkStatsSection />}
        </div>

        {/* Blocks and Transactions section */}
        
          {/* Solscan Table (replaces Latest Blocks and Latest Transactions) */}
          {isSolanaMode ? (
            <div className="flex flex-row gap-4">
              <SolscanTable />
              <TokenDashboard />
            </div>
          ) : (
            <>
              {/* Latest Transactions and Latest Blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Latest Transactions */}
              <div className={`bg-white rounded-lg shadow-md lg:col-span-1`}>
                <h2 className={`text-sm font-medium p-4 border-b border-gray-200`}>
                  Latest Transactions
                </h2>
                <LatestTransactions />
              </div>

              {/* Latest Blocks */}
              <div className={`bg-white rounded-lg shadow-md lg:col-span-1`}>
                <h2 className={`text-sm font-medium p-4 border-b border-gray-200`}>
                  Latest Blocks
                </h2>
                <LatestBlocks />
              </div>
            </div>
            </>
          )}

      </div>
    </>
  );
}
