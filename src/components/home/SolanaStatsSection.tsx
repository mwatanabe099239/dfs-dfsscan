"use client";

import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/src/lib/utils";
import { RowSkeleton } from "@/src/components/common/ItemSkeleton";

// API fetch functions
const fetchCirculationSupply = async () => {
  const response = await fetch("/api/dfschain-information/dfs-circulation-supply");
  return response.json();
};

const fetchLatestBlock = async () => {
  const response = await fetch("/api/dfschain-information/latest-block");
  return response.json();
};

const fetchTransactionCount = async () => {
  const response = await fetch("/api/dfschain-information/dfs-transaction-count?duration=all");
  return response.json();
};

interface StatCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

const StatCard = ({ title, children, isLoading }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full">
    {isLoading ? (
      <div className="space-y-3">
        <RowSkeleton className="h-7 w-32" />
        <RowSkeleton className="h-4 w-24" />
      </div>
    ) : (
      children
    )}
  </div>
);

export default function SolanaStatsSection() {
  // Available API calls
  const { data: circulationSupplyData, isLoading: isCirculationLoading } = useQuery({
    queryKey: ["circulation-supply"],
    queryFn: fetchCirculationSupply,
    staleTime: 300000,
  });

  const { data: latestBlockData, isLoading: isBlockLoading } = useQuery({
    queryKey: ["latest-block"],
    queryFn: fetchLatestBlock,
    staleTime: 10000,
  });

  const { data: transactionCountData, isLoading: isTransactionCountLoading } = useQuery({
    queryKey: ["transaction-count"],
    queryFn: fetchTransactionCount,
    staleTime: 60000,
  });

  const isLoading = isCirculationLoading || isBlockLoading || isTransactionCountLoading;

  // Available data from APIs
  const circulatingSupply = circulationSupplyData?.data || 0;
  const latestBlock = latestBlockData?.data || 0;
  const totalTransactions = transactionCountData?.data || 0;

  // MISSING DATA - Need to be provided:
  // 1. Total DFS Supply (to calculate non-circulating)
  // 2. TPS (Transactions Per Second) calculation
  // 3. True TPS calculation
  // 4. Staking data (Total Staked, Current Stake, Delinquent Stake)
  // 5. Average block time (to calculate time remaining in epoch)
  
  // For now, using available data and placeholders for missing data
  // Total supply is fixed at 100,000,000
  const totalSupply = 100000000;
  // Temporary non-circulating supply value
  const nonCirculatingSupply = 9380000; // Temporary value - TODO: Replace with actual non-circulating supply API
  // Calculate circulating supply to ensure total remains 100,000,000
  const displayedCirculatingSupply = totalSupply - nonCirculatingSupply;
  const circulatingPercent = totalSupply > 0 ? (displayedCirculatingSupply / totalSupply) * 100 : 0;
  const nonCirculatingPercent = totalSupply > 0 ? (nonCirculatingSupply / totalSupply) * 100 : 0;

  // Epoch calculation: Each epoch = 5000 blocks
  // Epoch 0: blocks 0-4999, Epoch 1: blocks 5000-9999, etc.
  const BLOCKS_PER_EPOCH = 5000;
  const currentEpoch = Math.floor(latestBlock / BLOCKS_PER_EPOCH);
  const blocksInCurrentEpoch = latestBlock % BLOCKS_PER_EPOCH;
  const epochProgress = (blocksInCurrentEpoch / BLOCKS_PER_EPOCH) * 100;
  const epochStartBlock = currentEpoch * BLOCKS_PER_EPOCH;
  const epochEndBlock = (currentEpoch + 1) * BLOCKS_PER_EPOCH - 1;
  const blocksRemaining = BLOCKS_PER_EPOCH - blocksInCurrentEpoch;
  
  // Time remaining calculation (assuming average block time)
  // MISSING: Need average block time API to calculate accurate time remaining
  const avgBlockTimeSeconds = 3; // Placeholder: 3 seconds per block (adjust based on actual DFS Chain block time)
  const secondsRemaining = blocksRemaining * avgBlockTimeSeconds;
  const daysRemaining = Math.floor(secondsRemaining / 86400);
  const hoursRemaining = Math.floor((secondsRemaining % 86400) / 3600);
  const minutesRemaining = Math.floor((secondsRemaining % 3600) / 60);
  const secondsRemainingFinal = Math.floor((secondsRemaining % 60));
  const timeRemaining = daysRemaining > 0 
    ? `${daysRemaining}d ${hoursRemaining}h ${minutesRemaining}m ${secondsRemainingFinal}s`
    : hoursRemaining > 0
    ? `${hoursRemaining}h ${minutesRemaining}m ${secondsRemainingFinal}s`
    : minutesRemaining > 0
    ? `${minutesRemaining}m ${secondsRemainingFinal}s`
    : `${secondsRemainingFinal}s`;

  const epochData = {
    current: currentEpoch,
    progress: epochProgress,
    blockRange: { from: epochStartBlock, to: epochEndBlock },
    timeRemaining: timeRemaining,
  };

  // Network data - Partially available
  const networkData = {
    totalTransactions,
    blockHeight: latestBlock,
    slotHeight: latestBlock, // Using block height as placeholder for slot height
    tps: 3139.35, // Temporary value - TODO: Replace with actual TPS calculation API
    trueTps: 1158, // Temporary value - TODO: Replace with actual True TPS calculation API
  };

  // Staking data - MISSING: Need staking APIs
  const stakeData = {
    total: 0, // MISSING: Need total staked DFS API
    current: 0, // MISSING: Need current stake API
    delinquent: 0, // MISSING: Need delinquent stake API
    currentPercent: 0,
    delinquentPercent: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* DFS Supply Card */}
      <StatCard title="DFS Supply" isLoading={isLoading}>
        <div className="flex flex-col gap-4 items-start justify-start">
          <div>
            <div className="text-[14px] font-normal text-gray-900 leading-[24px]">DFS Supply</div>
            <div className="text-gray-900 text-[15px] sm:text-[18px] font-bold leading-[24px]">
              {totalSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 w-full">
            <div className="flex flex-col gap-4 items-start justify-start">
              <div>
                <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Circulating Supply</div>
                <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                  {displayedCirculatingSupply.toLocaleString(undefined, { maximumFractionDigits: 4 })} DFS
                  {totalSupply > 0 && (
                    <span className="text-gray-500"> ({circulatingPercent.toFixed(2)}%)</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 bg-gray-200 h-[1px] w-full"></div>
              {totalSupply > 0 && (
                <div>
                  <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Non-circulating Supply</div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {nonCirculatingSupply.toLocaleString(undefined, { maximumFractionDigits: 4 })} DFS
                    <span className="text-gray-500"> ({nonCirculatingPercent.toFixed(2)}%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </StatCard>

      {/* Current Epoch Card */}
      <StatCard title="Current Epoch" isLoading={isLoading}>
        <div className="flex flex-col gap-4 items-start justify-start">
          <div className="w-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full">
              <div className="text-[14px] font-normal text-gray-900 leading-[24px]">Current Epoch</div>
              <div className="relative overflow-hidden rounded-full bg-gray-200 w-[100px] h-[5px]">
                <div
                  className="h-full w-full flex-1 bg-green-500 transition-all"
                  style={{ transform: `translateX(-${100 - epochData.progress}%)` }}
                />
              </div>
            </div>
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full">
              <a href={`/epoch/${epochData.current}`} className="text-gray-900 text-[15px] sm:text-[18px] font-bold leading-[24px] hover:underline">
                {epochData.current}
              </a>
              <div className="text-[14px] font-normal text-gray-500 leading-[24px]">
                {epochData.progress.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 w-full">
            <div className="flex flex-col gap-4 items-start justify-start">
              <div>
                <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Slot Range</div>
                <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {epochData.blockRange.from.toLocaleString()}
                  </div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">to</div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {epochData.blockRange.to.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="shrink-0 bg-gray-200 h-[1px] w-full"></div>
              <div>
                <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Time Remain</div>
                <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                  {epochData.timeRemaining}
                </div>
              </div>
            </div>
          </div>
        </div>
      </StatCard>

      {/* Network (Transactions) Card */}
      <StatCard title="Network (Transactions)" isLoading={isLoading}>
        <div className="flex flex-col gap-4 items-start justify-start">
          <div>
            <div className="text-[14px] font-normal text-gray-900 leading-[24px]">Network (Transactions)</div>
            <div className="text-gray-900 text-[15px] sm:text-[18px] font-bold leading-[24px]">
              {networkData.totalTransactions.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 w-full">
            <div className="flex flex-col gap-4 items-start justify-start">
              <div className="flex flex-row flex-wrap justify-start w-full gap-y-4 -mx-1">
                <div className="max-w-[50%] flex-[50%] px-1">
                  <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Block Height</div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {networkData.blockHeight.toLocaleString()}
                  </div>
                </div>
                <div className="max-w-[50%] flex-[50%] px-1">
                  <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Slot Height</div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {networkData.slotHeight.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="shrink-0 bg-gray-200 h-[1px] w-full"></div>
              <div className="flex flex-row flex-wrap justify-start w-full gap-y-4 -mx-1">
                <div className="max-w-[50%] flex-[50%] px-1">
                  <div className="text-[14px] font-normal text-blue-600 leading-[24px] cursor-pointer hover:underline">
                    TPS
                  </div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {formatNumber(networkData.tps, 2)}
                  </div>
                </div>
                <div className="max-w-[50%] flex-[50%] px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="text-[14px] font-normal text-blue-600 leading-[24px] cursor-pointer hover:underline">
                      True TPS
                    </div>
                    <div className="inline-flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {networkData.trueTps.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StatCard>

      {/* Total Stake (DFS) Card */}
      <StatCard title="Total Stake (DFS)" isLoading={isLoading}>
        <div className="flex flex-col gap-4 items-start justify-start">
          <div className="flex gap-1 flex-row items-stretch justify-between flex-wrap w-full">
            <div>
              <div className="text-[14px] font-normal text-gray-900 leading-[24px]">Total Stake (DFS)</div>
              <div className="text-gray-900 text-[15px] sm:text-[18px] font-bold leading-[24px]">
                {stakeData.total > 0 ? (
                  stakeData.total.toLocaleString(undefined, { maximumFractionDigits: 2 })
                ) : (
                  <span className="text-gray-400 text-base">Not Available</span>
                )}
              </div>
            </div>
          </div>
          {stakeData.total > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 w-full">
              <div className="flex flex-col gap-4 items-start justify-start">
                <div>
                  <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Current Stake</div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {stakeData.current.toLocaleString(undefined, { maximumFractionDigits: 4 })} DFS ({stakeData.currentPercent.toFixed(5)}%)
                  </div>
                </div>
                <div className="shrink-0 bg-gray-200 h-[1px] w-full"></div>
                <div>
                  <div className="text-[14px] font-normal text-gray-500 leading-[24px]">Delinquent Stake</div>
                  <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
                    {stakeData.delinquent.toLocaleString(undefined, { maximumFractionDigits: 4 })} DFS ({stakeData.delinquentPercent.toFixed(5)}%)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Staking data not available
            </div>
          )}
        </div>
      </StatCard>
    </div>
  );
}
