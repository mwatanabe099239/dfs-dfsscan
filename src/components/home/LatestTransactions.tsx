"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { Transaction } from "@/src/types";
import { getLatestTransactions } from "@/src/lib/firebase";
import { formatTimeAgo, shortenAddress, shortenHash } from "@/src/lib/utils";
import ItemSkeleton from "../common/ItemSkeleton";

export default function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="divide-y divide-gray-200">
        {[...Array(6)].map((_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  const formatAddress = (address: string) => {
    if (!address) return "";
    return shortenAddress(address);
  };

  return (
    <div className="divide-y divide-gray-200 text-sm">
      {transactions.map((tx) => (
        <div key={tx.transactionHash} className="p-4 hover:bg-gray-50">
          <div className="flex md:flex-row flex-col md:items-center items-start gap-3">
            <div className="text-gray-400 md:block hidden">
              <FontAwesomeIcon icon={faFileAlt} className="w-6 h-6!" />
            </div>
            <div className="min-w-[180px] flex md:flex-col flex-row md:items-start items-center md:gap-0 gap-1">
              <span className="md:hidden block">TX# </span>
              <Link
                href={`/tx/${tx.transactionHash}`}
                className="text-[#0784c3] hover:text-blue-600 block"
              >
                {shortenHash(tx.transactionHash)}
              </Link>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(tx.createdAt.getTime() / 1000)}
              </span>
            </div>
            <div className="flex-1">
              <div>
                <span className="text-black">From </span>
                <Link
                  href={`/address/${
                    tx.method === "Token Created"
                      ? ZERO_ADDRESS
                      : tx.fromAddress
                  }`}
                  className="text-[#0784c3] hover:text-blue-600"
                >
                  {formatAddress(
                    tx.method === "Token Created"
                      ? ZERO_ADDRESS
                      : tx.fromAddress
                  )}
                </Link>
              </div>
              <div>
                <span className="text-black">To </span>
                <Link
                  href={`/address/${
                    tx.method === "Token Created"
                      ? tx.fromAddress
                      : tx.toAddress
                  }`}
                  className="text-[#0784c3] hover:text-blue-600"
                >
                  {formatAddress(
                    tx.method === "Token Created"
                      ? tx.fromAddress
                      : tx.toAddress
                  )}
                </Link>
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="bg-transparent border border-gray-300 text-black py-1 px-2 rounded-md text-xs">
                {tx.gasFee} DFS
              </span>
            </div>
          </div>
        </div>
      ))}
      <div className="p-4 text-center bg-gray-50">
        <Link
          href="/txs"
          className="text-grey-300 hover:text-[#0784c3] uppercase text-xs"
        >
          View All Transactions →
        </Link>
      </div>
    </div>
  );
}
