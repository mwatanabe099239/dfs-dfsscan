"use client";

import SearchBar from "@/src/components/SearchBar";
import NetworkStatsSection from "@/src/components/home/NetworkStats";
import LatestBlocks from "@/src/components/home/LatestBlocks";
import LatestTransactions from "@/src/components/home/LatestTransactions";
import Image from "next/image";

// Temporary mock data - replace with Firebase data later
const mockNetworkStats = {
  bnbPrice: 610.63,
  transactions24h: 6952.75,
  tps: 82.1,
  medianGasPrice: "1 Gwei",
  medianGasPriceUSD: "$0.01",
  bnbMarketCap: 91809388782.0,
  bnbSupply: 150352322,
  latestBlock: 47605447,
  blockTime: 3,
  votingPower: 30307620.04,
  btcPrice: 0.007243,
  priceChange: -2.71,
};

export default function Home() {
  return (
    <div>
      {/* Full width black background section */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[#131313] bg-[url('/icons/waves-light.svg')] bg-repeat -z-1" />

      {/* Overview section - positioned to overlap the black background */}
      <div className="px-4 -mt-10 z-10">
        <div className="pt-16 mb-16 flex justify-between">
          <div className="w-2/3">
            <div className="text-left mb-2">
              <h1 className="text-xl text-white mb-1">
                DFS Web Chain Explorer
              </h1>
            </div>
            <SearchBar />
          </div>
          <div className="w-1/3 flex items-start justify-center">
            <div className="w-fit relative md:block hidden">
              <div className="absolute -top-2 right-5 bg-white text-black px-2 py-1 text-xs rounded-md">
                Ad
              </div>
              <Image
                src="/images/ads.png"
                alt="DFS Logo"
                className="h-auto object-contain rounded-lg cursor-pointer"
                width={300}
                height={100}
                priority
                onClick={() => {
                  window.open("https://quickido.com", "_blank");
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg mb-6 p-4">
          <NetworkStatsSection stats={mockNetworkStats} />
        </div>

        {/* Blocks and Transactions section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Latest Blocks */}
          <div className="bg-white rounded-lg shadow-lg lg:col-span-1">
            <h2 className="text-sm font-medium p-4 border-b border-gray-200">
              Latest Blocks
            </h2>
            <LatestBlocks />
          </div>

          {/* Latest Transactions */}
          <div className="bg-white rounded-lg shadow-lg lg:col-span-1">
            <h2 className="text-sm font-medium p-4 border-b border-gray-200">
              Latest Transactions
            </h2>
            <LatestTransactions />
          </div>
        </div>
      </div>
    </div>
  );
}
