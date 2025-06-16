"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faClock, faCube } from "@fortawesome/free-solid-svg-icons";
import { NetworkStats } from "@/src/types";
import { formatNumber } from "@/src/lib/utils";
import { Separator } from "../ui/separator";

interface StatsItemProps {
  icon: React.ReactNode;
  label: string;
  mainValue: string;
  subValue?: string;
}

const StatsItem = ({ icon, label, mainValue, subValue }: StatsItemProps) => (
  <div className="flex gap-2 items-start pl-2">
    <div className="flex items-center gap-1.5 mb-0.5">
      <div className="text-gray-600 text-2xl w-6">{icon}</div>
    </div>
    <div className="flex flex-col gap-0.5">
      <div className="uppercase text-sm text-gray-600">{label}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base">{mainValue}</span>
        {subValue && (
          <span className="text-sm text-gray-600">({subValue})</span>
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
    <div className="flex flex-col gap-4 md:flex-row md:gap-0 py-0 ">
      <div className="w-full md:w-1/3 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
        <div className="flex flex-col justify-items-start">
          <StatsItem
            icon={<FontAwesomeIcon icon={faList} />}
            label="DFS Price"
            mainValue={`$${formatNumber(
              Number(networkStats.onChainTokenPrice.priceUsd.toFixed(6))
            )} (+${networkStats.onChainTokenPrice.priceChange.h24.toFixed(
              2
            )}%)`}
          />
          <Separator />
          <StatsItem
            icon={<FontAwesomeIcon icon={faList} />}
            label="Transactions"
            mainValue={networkStats.dfsTransactionCount.toLocaleString()}
          />
        </div>
      </div>
      <div className="w-full md:w-1/3 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
        <div className="flex flex-col justify-items-start">
          <StatsItem
            icon={<FontAwesomeIcon icon={faList} />}
            label="Transactions"
            mainValue={networkStats.dfsTransactionCount.toLocaleString()}
          />
          <Separator />
          <StatsItem
            icon={<FontAwesomeIcon icon={faList} />}
            label="Transactions"
            mainValue={networkStats.dfsTransactionCount.toLocaleString()}
          />
        </div>
      </div>
      <div className="w-full md:w-1/3 flex items-center">
        <div className="flex flex-col justify-items-start">
          <StatsItem
            icon={<FontAwesomeIcon icon={faList} />}
            label="Transactions"
            mainValue={networkStats.dfsTransactionCount.toLocaleString()}
          />
          <Separator />
          <StatsItem
            icon={<FontAwesomeIcon icon={faList} />}
            label="Transactions"
            mainValue={networkStats.dfsTransactionCount.toLocaleString()}
          />
        </div>
      </div>
      <div className="w-full md:w-1/3 flex items-center">
        <div className="flex flex-col justify-items-start">
         
        </div>
      </div>
    </div>
  );
}
