"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NetworkStats } from "@/src/types";
import { formatCompactNumber, formatNumber } from "@/src/lib/utils";
import { Separator } from "../ui/separator";
import { TransactionHistoryChart } from "./twoWeekTransactionChart";
import Image from "next/image";
import { Globe, List, CreditCard, Landmark, ClockFading } from "lucide-react";
import { spawn } from "child_process";

interface StatsItemProps {
  icon: React.ReactNode;
  label: string;
  mainValue: string;
  subValue?: string;
  subValueColor?: string;
}

const StatsItem = ({
  icon,
  label,
  mainValue,
  subValue,
  subValueColor,
}: StatsItemProps) => (
  <div className="flex gap-2 items-start">
    <div className="flex items-center gap-1.5 mb-0.5">
      <div className="text-gray-600 text-2xl w-6">{icon}</div>
    </div>
    <div className="flex flex-col gap-0.5">
      <div className="uppercase text-sm text-gray-500">{label}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base">{mainValue}</span>
        {subValue && (
          <>
            <span className="text-sm text-gray-600">(</span>
            <span className={`text-sm ${subValueColor || "text-gray-600"}`}>
              {subValue}
            </span>
            <span className="text-sm text-gray-600">)</span>
          </>
        )}
      </div>
    </div>
  </div>
);

export default function NetworkStatsSection() {
  const [isLoading, setIsLoading] = useState(true);

  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    onChainTokenPrice: {
      priceUsd: 0,
      priceChange: {
        m5: 0,
        h1: 0,
        h6: 0,
        h24: 0,
      },
    },
    dfsCirculationSupply: 0,
    latestBlock: 0,
    dfsTransactionCount: 0,
    twoWeekTransactionHistory: [],
    holdersCount: 0,
    dfsBaseFee: 0,
  });

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const [
        priceData,
        dfsCirculationSupplyData,
        latestBlockData,
        dfsTransactionCountData,
        twoWeekTransactionHistoryData,
        holdersCountData,
        baseFeeData,
      ] = await Promise.all([
        fetch("/api/dfs-onchain-token-price").then((res) => res.json()),
        fetch("/api/dfschain-information/dfs-circulation-supply").then((res) =>
          res.json()
        ),
        fetch("/api/dfschain-information/latest-block").then((res) =>
          res.json()
        ),
        fetch(
          "/api/dfschain-information/dfs-transaction-count?duration=all"
        ).then((res) => res.json()),
        fetch("/api/dfschain-information/two-week-transaction-history").then(
          (res) => res.json()
        ),
        fetch(
          "/api/dfschain-information/holders-count?tokenAddress=drc20_dfs"
        ).then((res) => res.json()),
        fetch("/api/dfschain-information/dfs-base-fee").then((res) =>
          res.json()
        ),
      ]);

      setIsLoading(false);

      console.log(
        priceData,
        dfsCirculationSupplyData,
        latestBlockData,
        dfsTransactionCountData,
        twoWeekTransactionHistoryData,
        holdersCountData,
        baseFeeData
      );
      setNetworkStats({
        onChainTokenPrice: priceData.data,
        dfsCirculationSupply: dfsCirculationSupplyData.data,
        latestBlock: latestBlockData.data,
        dfsTransactionCount: dfsTransactionCountData.data,
        twoWeekTransactionHistory: twoWeekTransactionHistoryData.data,
        holdersCount: holdersCountData.data,
        dfsBaseFee: baseFeeData.data,
      });
    };

    init();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 py-0">
      <div className="flex items-center md:border-r border-gray-200 md:px-4">
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
              Number(networkStats.onChainTokenPrice.priceUsd.toFixed(6))
            )}`}
            subValue={`
               ${
                 networkStats.onChainTokenPrice.priceChange.h24 >= 0 ? "+" : "-"
               }${networkStats.onChainTokenPrice.priceChange.h24.toFixed(2)}%`}
            subValueColor={
              networkStats.onChainTokenPrice.priceChange.h24 >= 0
                ? "text-[#0784c3]"
                : "text-red-500"
            }
          />
          <Separator className="bg-gray-200 my-4" />
          <StatsItem
            icon={<Globe className="w-6 h-6" />}
            label="Circulation Supply (MCap)"
            mainValue={`${formatNumber(
              Number(networkStats.dfsCirculationSupply.toFixed(6))
            )}`}
            subValue={`$${formatCompactNumber(
              Number(networkStats.dfsCirculationSupply) *
                networkStats.onChainTokenPrice.priceUsd
            )}`}
          />
          <Separator className="bg-gray-200 my-4 xl:hidden block" />
        </div>
      </div>
      <div className="flex items-center md:border-r border-gray-200 md:px-4">
        <div className="flex flex-col justify-items-start w-full">
          <StatsItem
            icon={<List className="w-6 h-6" />}
            label="DFS Holders"
            mainValue={networkStats.holdersCount.toLocaleString()}
          />
          <Separator className="bg-gray-200 my-4" />
          <StatsItem
            icon={<CreditCard className="w-6 h-6" />}
            label="Total Transactions"
            mainValue={networkStats.dfsTransactionCount.toLocaleString()}
          />
          <Separator className="bg-gray-200 my-4 xl:hidden block" />
        </div>
      </div>
      <div className="flex items-center md:border-r border-gray-200 md:px-4">
        <div className="flex flex-col justify-items-start w-full">
          <StatsItem
            icon={<Landmark className="w-6 h-6" />}
            label="Base Fee"
            mainValue={`${networkStats.dfsBaseFee.toLocaleString()} DFS`}
          />
          <Separator className="bg-gray-200 my-4" />
          <StatsItem
            icon={<ClockFading className="w-6 h-6" />}
            label="Latest Block"
            mainValue={networkStats.latestBlock.toString()}
          />
          <Separator className="bg-gray-200 my-4 xl:hidden block" />
        </div>
      </div>
      <div className="flex items-center md:px-4">
        <div className="flex flex-col justify-items-start w-full">
          <div className="uppercase text-sm text-gray-500">
            DFS Chain Transaction History In 14 Days
          </div>
          <TransactionHistoryChart
            data={networkStats.twoWeekTransactionHistory}
          />
        </div>
      </div>
    </div>
  );
}
