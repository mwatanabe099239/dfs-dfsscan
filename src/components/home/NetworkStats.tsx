"use client";

import { useQuery } from "@tanstack/react-query";
import { formatCompactNumber, formatNumber } from "@/src/lib/utils";
import { Separator } from "@/src/components/ui/separator";
import { TransactionHistoryChart } from "./twoWeekTransactionChart";
import Image from "next/image";
import { Globe, List, CreditCard, Landmark, ClockFading } from "lucide-react";
import { DFS_BASE_FEE_IN_USD } from "@/src/lib/constant";
import { RowSkeleton } from "@/src/components/common/ItemSkeleton";
import { useViewMode } from "@/src/contexts/ViewModeContext";

interface StatsItemProps {
  icon: React.ReactNode;
  label: string;
  mainValue: string;
  subValue?: string;
  subValueColor?: string;
  isLoading: boolean;
  isSolanaMode?: boolean;
}

const StatsItem = ({
  icon,
  label,
  mainValue,
  subValue,
  subValueColor,
  isLoading,
  isSolanaMode = false,
}: StatsItemProps) => (
  <div className="flex gap-2 items-start">
    <div className="flex items-center gap-1.5 mb-0.5">
      <div className={`text-2xl w-6 ${isSolanaMode ? "text-gray-400" : "text-gray-600"}`}>{icon}</div>
    </div>
    <div className="flex flex-col gap-0.5">
      <div className={`uppercase text-sm ${isSolanaMode ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
      {isLoading ? (
        <RowSkeleton className="!w-16" />
      ) : (
        <div className="flex items-baseline gap-0.5">
          <span className={`text-base ${isSolanaMode ? "text-gray-200" : ""}`}>{mainValue}</span>
          {subValue && (
            <>
              <span className={`text-sm ${isSolanaMode ? "text-gray-500" : "text-gray-600"}`}>(</span>
              <span className={`text-sm ${subValueColor || (isSolanaMode ? "text-gray-400" : "text-gray-600")}`}>
                {subValue}
              </span>
              <span className={`text-sm ${isSolanaMode ? "text-gray-500" : "text-gray-600"}`}>)</span>
            </>
          )}
        </div>
      )}
    </div>
  </div>
);

// API fetch functions
const fetchTokenPrice = async () => {
  const response = await fetch("/api/dfs-onchain-token-price");
  return response.json();
};

const fetchCirculationSupply = async () => {
  const response = await fetch(
    "/api/dfschain-information/dfs-circulation-supply"
  );
  return response.json();
};

const fetchLatestBlock = async () => {
  const response = await fetch("/api/dfschain-information/latest-block");
  return response.json();
};

const fetchTransactionCount = async () => {
  const response = await fetch(
    "/api/dfschain-information/dfs-transaction-count?duration=all"
  );
  return response.json();
};

const fetchTransactionHistory = async () => {
  const response = await fetch(
    "/api/dfschain-information/two-week-transaction-history"
  );
  return response.json();
};

const fetchHoldersCount = async () => {
  const response = await fetch(
    "/api/dfschain-information/holders-count?tokenAddress=drc20_dfs"
  );
  return response.json();
};

const fetchBaseFee = async () => {
  const response = await fetch("/api/dfschain-information/dfs-base-fee");
  return response.json();
};

export default function NetworkStatsSection() {
  const { viewMode } = useViewMode();
  const isSolanaMode = viewMode === "solanascan";

  // Individual queries for each API endpoint
  const { data: priceData, isLoading: isPriceLoading } = useQuery({
    queryKey: ["token-price"],
    queryFn: fetchTokenPrice,
    staleTime: 30000, // 30 seconds
  });

  const { data: circulationSupplyData, isLoading: isCirculationLoading } =
    useQuery({
      queryKey: ["circulation-supply"],
      queryFn: fetchCirculationSupply,
      staleTime: 300000, // 5 minutes
    });

  const { data: latestBlockData, isLoading: isBlockLoading } = useQuery({
    queryKey: ["latest-block"],
    queryFn: fetchLatestBlock,
    staleTime: 10000, // 10 seconds
  });

  const { data: transactionCountData, isLoading: isTransactionCountLoading } =
    useQuery({
      queryKey: ["transaction-count"],
      queryFn: fetchTransactionCount,
      staleTime: 60000, // 1 minute
    });

  const { data: transactionHistoryData, isLoading: isHistoryLoading } =
    useQuery({
      queryKey: ["transaction-history"],
      queryFn: fetchTransactionHistory,
      staleTime: 300000, // 5 minutes
    });

  const { data: holdersCountData, isLoading: isHoldersLoading } = useQuery({
    queryKey: ["holders-count"],
    queryFn: fetchHoldersCount,
    staleTime: 300000, // 5 minutes
  });

  const { data: baseFeeData, isLoading: isBaseFeeLoading } = useQuery({
    queryKey: ["base-fee"],
    queryFn: fetchBaseFee,
    staleTime: 60000, // 1 minute
  });

  // Check if any query is loading
  const isLoading =
    isPriceLoading ||
    isCirculationLoading ||
    isBlockLoading ||
    isTransactionCountLoading ||
    isHistoryLoading ||
    isHoldersLoading ||
    isBaseFeeLoading;

  // Calculate derived values
  const baseFeeInDFS =
    priceData?.data && baseFeeData?.data
      ? baseFeeData.data / priceData.data.priceUsd
      : 0;

  const marketCap =
    priceData?.data && circulationSupplyData?.data
      ? circulationSupplyData.data * priceData.data.priceUsd
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 py-0">
      <div className={`flex items-center md:border-r md:px-4 ${isSolanaMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex flex-col justify-items-start w-full">
          <StatsItem
            icon={
              <Image
                src="/images/dfs-token.png"
                alt="DFS Token"
                className="object-cover"
                width={24}
                height={24}
              />
            }
            label="DFS Price"
            mainValue={`$${formatNumber(
              Number((priceData?.data?.priceUsd || 0).toFixed(6))
            )}`}
            subValue={`
               ${
                 (priceData?.data?.priceChange?.h24 || 0) >= 0 ? "+" : "-"
               }${Math.abs(priceData?.data?.priceChange?.h24 || 0).toFixed(
              2
            )}%`}
            subValueColor={
              (priceData?.data?.priceChange?.h24 || 0) >= 0
                ? "text-[#21f201]"
                : "text-[#ea3943]"
            }
            isLoading={isLoading}
            isSolanaMode={isSolanaMode}
          />
          <Separator className={`my-4 ${isSolanaMode ? "bg-gray-700" : "bg-gray-200"}`} />
          <StatsItem
            icon={<Globe className="w-6 h-6" />}
            label="Circulation Supply (MCap)"
            mainValue={`${formatNumber(
              Number((circulationSupplyData?.data || 0).toFixed(6))
            )}`}
            subValue={`$${formatCompactNumber(marketCap)}`}
            isLoading={isLoading}
            isSolanaMode={isSolanaMode}
          />
          <Separator className={`my-4 xl:hidden block ${isSolanaMode ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>
      </div>
      <div className={`flex items-center md:border-r md:px-4 ${isSolanaMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex flex-col justify-items-start w-full">
          <StatsItem
            icon={<List className="w-6 h-6" />}
            label="DFS Holders"
            mainValue={(holdersCountData?.data || 0).toLocaleString()}
            isLoading={isLoading}
            isSolanaMode={isSolanaMode}
          />
          <Separator className={`my-4 ${isSolanaMode ? "bg-gray-700" : "bg-gray-200"}`} />
          <StatsItem
            icon={<CreditCard className="w-6 h-6" />}
            label="Total Transactions"
            mainValue={(transactionCountData?.data || 0).toLocaleString()}
            isLoading={isLoading}
            isSolanaMode={isSolanaMode}
          />
          <Separator className={`my-4 xl:hidden block ${isSolanaMode ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>
      </div>
      <div className={`flex items-center md:border-r md:px-4 ${isSolanaMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex flex-col justify-items-start w-full">
          <StatsItem
            icon={<Landmark className="w-6 h-6" />}
            label="Base Fee"
            mainValue={`${formatNumber(Number(baseFeeInDFS.toFixed(6)))} DFS`}
            subValue={`$${DFS_BASE_FEE_IN_USD}`}
            subValueColor={isSolanaMode ? "text-white" : "text-[#0784c3]"}
            isLoading={isLoading}
            isSolanaMode={isSolanaMode}
          />
          <Separator className={`my-4 ${isSolanaMode ? "bg-gray-700" : "bg-gray-200"}`} />
          <StatsItem
            icon={<ClockFading className="w-6 h-6" />}
            label="Latest Block"
            mainValue={(latestBlockData?.data || 0).toString()}
            isLoading={isLoading}
            isSolanaMode={isSolanaMode}
          />
          <Separator className={`my-4 xl:hidden block ${isSolanaMode ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>
      </div>
      <div className="flex items-center md:px-4">
        <div className="flex flex-col justify-items-start w-full">
          <div className={`uppercase text-sm ${isSolanaMode ? "text-gray-400" : "text-gray-500"}`}>
            DFS Chain Transaction History In 14 Days
          </div>
          <TransactionHistoryChart data={transactionHistoryData?.data || []} />
        </div>
      </div>
    </div>
  );
}
