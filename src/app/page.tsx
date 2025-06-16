"use client";

import SearchBar from "@/src/components/SearchBar";
import NetworkStatsSection from "@/src/components/home/NetworkStats";
import LatestBlocks from "@/src/components/home/LatestBlocks";
import LatestTransactions from "@/src/components/home/LatestTransactions";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="py-16 -mt-8 bg-[url('/icons/waves-light.svg')] w-full h-[280px] bg-[#131313] bg-repeat">
        <div className="container mx-auto px-4 flex justify-between ">
          <div className="w-full md:w-2/3">
            <div className="text-left mb-2">
              <h1 className="text-xl text-white mb-1 font-bold">
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

      <div className="px-4 container mx-auto">
        <div className="bg-white rounded-lg shadow-md mb-6 py-4 md:px-1 px-4 mt-[-30px]">
          <NetworkStatsSection />
        </div>

        {/* Blocks and Transactions section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Latest Blocks */}
          <div className="bg-white rounded-lg shadow-md lg:col-span-1">
            <h2 className="text-sm font-medium p-4 border-b border-gray-200">
              Latest Blocks
            </h2>
            <LatestBlocks />
          </div>

          {/* Latest Transactions */}
          <div className="bg-white rounded-lg shadow-md lg:col-span-1">
            <h2 className="text-sm font-medium p-4 border-b border-gray-200">
              Latest Transactions
            </h2>
            <LatestTransactions />
          </div>
        </div>
      </div>
    </>
  );
}
