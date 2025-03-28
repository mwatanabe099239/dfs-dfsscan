import SearchBar from "@/src/components/SearchBar";
import NetworkStatsSection from "@/src/components/home/NetworkStats";
import LatestBlocks from "@/src/components/home/LatestBlocks";
import LatestTransactions from "@/src/components/home/LatestTransactions";

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
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[#131313] bg-[url('/icons/waves-light.svg')] bg-repeat z-[-1]">
        {/* Content container */}
      </div>

      {/* Overview section - positioned to overlap the black background */}
      <div className="px-4 -mt-12">
        <div className="pt-16 mb-16">
          <div className="text-left mb-2">
            <h1 className="text-xl text-white mb-1">DFS Web Chain Explorer</h1>
          </div>
          <SearchBar />
        </div>
        <div className="bg-white rounded-lg shadow-lg mb-6">
          {/* Overview content */}
          <div className="p-4">
            <NetworkStatsSection stats={mockNetworkStats} />
          </div>
        </div>

        {/* Blocks and Transactions section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Latest Blocks */}
          <div className="bg-white rounded-lg shadow-lg lg:col-span-1">
            <h2 className="text-md font-semibold p-4 border-b border-gray-200">
              Latest Blocks
            </h2>
            <LatestBlocks />
          </div>

          {/* Latest Transactions */}
          <div className="bg-white rounded-lg shadow-lg lg:col-span-1">
            <h2 className="text-md font-semibold p-4 border-b border-gray-200">
              Latest Transactions
            </h2>
            <LatestTransactions />
          </div>
        </div>
      </div>
    </div>
  );
}
