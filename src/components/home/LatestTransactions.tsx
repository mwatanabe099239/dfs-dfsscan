"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { Transaction } from "@/src/types";
import { getLatestTransactions } from "@/src/lib/firebase";
import { formatNumber, formatTimeAgo, shortenHash } from "@/src/lib/utils";
import ItemSkeleton from "../common/ItemSkeleton";
import { useViewMode } from "@/src/contexts/ViewModeContext";
import AddressDisplay from "@/src/components/common/AddressDisplay";

export default function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useViewMode();
  const isSolanaMode = viewMode === "solanascan";

  const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const fetchTransactions = async () => {
      const txs = await getLatestTransactions();
      setTransactions(txs);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className={`divide-y flex-1 ${isSolanaMode ? "divide-gray-700" : "divide-gray-200"}`}>
          {[...Array(6)].map((_, i) => (
            <ItemSkeleton key={i} />
          ))}
        </div>
        <div className={`p-4 text-center mt-auto ${isSolanaMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <Link
            href="/txs"
            className={`uppercase text-xs ${isSolanaMode ? "text-gray-300 hover:text-white" : "text-grey-300 hover:text-[#0784c3]"}`}
          >
            View All Transactions →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[90%]">
      <div className={`divide-y text-sm flex-1 ${isSolanaMode ? "divide-gray-700" : "divide-gray-200"}`}>
        {transactions.map((tx) => (
          <div key={tx.transactionHash} className={`p-4 ${isSolanaMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
            <div className="flex md:flex-row flex-col md:items-center items-start gap-3">
              <div className={`md:block hidden ${isSolanaMode ? "text-gray-500" : "text-gray-400"}`}>
                <FontAwesomeIcon icon={faFileAlt} className="w-6 h-6!" />
              </div>
              <div className="min-w-[180px] flex md:flex-col flex-row md:items-start items-center md:gap-0 gap-1">
                <span className={`md:hidden block ${isSolanaMode ? "text-gray-300" : ""}`}>TX# </span>
                <Link
                  href={`/tx/${tx.transactionHash}`}
                  className={`block ${isSolanaMode ? "text-white hover:text-gray-300" : "text-[#0784c3] hover:text-blue-600"}`}
                >
                  {shortenHash(tx.transactionHash)}
                </Link>
                <span className={`text-xs ${isSolanaMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                </span>
              </div>
              <div className="flex-1">
                <div>
                  <span className={isSolanaMode ? "text-gray-200" : "text-black"}>From </span>
                  <AddressDisplay
                    address={
                      tx.method === "Token Created"
                        ? ZERO_ADDRESS
                        : tx.fromAddress
                    }
                    className={isSolanaMode ? "text-white hover:text-gray-300" : "text-[#0784c3] hover:text-blue-600"}
                  />
                </div>
                <div>
                  <span className={isSolanaMode ? "text-gray-200" : "text-black"}>To </span>
                  <AddressDisplay
                    address={
                      tx.method === "Token Created"
                        ? tx.fromAddress
                        : tx.toAddress
                    }
                    className={isSolanaMode ? "text-white hover:text-gray-300" : "text-[#0784c3] hover:text-blue-600"}
                  />
                </div>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className={`bg-transparent border py-1 px-2 rounded-md text-xs ${
                  isSolanaMode 
                    ? "border-gray-600 text-gray-300" 
                    : "border-gray-300 text-black"
                }`}>
                  {formatNumber(Number(tx.gasFee), 6)} DFS
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`p-4 text-center mt-auto ${isSolanaMode ? "bg-gray-700" : "bg-gray-50"}`}>
        <Link
          href="/txs"
          className={`uppercase text-xs ${isSolanaMode ? "text-gray-300 hover:text-[#9945FF]" : "text-grey-300 hover:text-[#0784c3]"}`}
        >
          View All Transactions →
        </Link>
      </div>
    </div>
  );
}
