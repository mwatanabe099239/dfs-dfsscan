"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { Transaction } from "@/src/types";
import { getNetworkStats, getTransactions } from "@/src/lib/firebase";
import { formatTimeAgo } from "@/src/lib/utils";
import Pagination from "@/src/components/common/Pagination";

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
            <th className="p-3 whitespace-nowrap">Transaction Hash</th>
            <th className="p-3 whitespace-nowrap">Method</th>
            <th className="p-3 whitespace-nowrap">Age</th>
            <th className="p-3 whitespace-nowrap">From</th>
            <th className="p-3 whitespace-nowrap">To</th>
            <th className="p-3 whitespace-nowrap text-right">Amount</th>
            <th className="p-3 whitespace-nowrap text-right">Gas Fee</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="text-gray-200">
                    <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
                  </div>
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                </div>
              </td>
              <td className="p-3">
                <div className="w-20 h-4 bg-gray-200 rounded" />
              </td>
              <td className="p-3">
                <div className="w-24 h-4 bg-gray-200 rounded" />
              </td>
              <td className="p-3">
                <div className="w-32 h-4 bg-gray-200 rounded" />
              </td>
              <td className="p-3">
                <div className="w-32 h-4 bg-gray-200 rounded" />
              </td>
              <td className="p-3">
                <div className="w-20 h-4 bg-gray-200 rounded ml-auto" />
              </td>
              <td className="p-3">
                <div className="w-20 h-4 bg-gray-200 rounded ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total24h: 0,
    networkFee24h: "0",
    avgTxnFee24h: "1.00",
  });
  const [txData, setTxData] = useState({
    total: 0,
    perPage: 10,
    currentPage: page,
    transactions: [] as Transaction[],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { totalTransactions } = await getNetworkStats();
      const transactions = await getTransactions(page, perPage);

      // Calculate 24h transactions
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const last24hTxs = transactions.filter((tx) => tx.createdAt > oneDayAgo);
      const total24h = last24hTxs.length;
      const networkFee24h = total24h.toString(); // Assuming 1 DFS per transaction

      setStats({
        total24h,
        networkFee24h,
        avgTxnFee24h: "1.00",
      });

      setTxData({
        total: totalTransactions,
        perPage,
        currentPage: page,
        transactions,
      });
      setLoading(false);
    };

    fetchData();
  }, [page, perPage]);

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(event.target.value);
    setPerPage(newPerPage);
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 space-y-4">
      {/* Stats Cards - only show when no address filter */}
      {!searchParams.get("a") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">TRANSACTIONS (24H)</div>
            <div className="text-lg font-medium">
              {stats.total24h.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">
              NETWORK TRANSACTIONS FEE (24H)
            </div>
            <div className="text-lg font-medium">{stats.networkFee24h} DFS</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">
              AVG. TRANSACTION FEE (24H)
            </div>
            <div className="text-lg font-medium">{stats.avgTxnFee24h} DFS</div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg">Transactions</h2>
              {searchParams.get("a") && (
                <span className="text-sm text-gray-500">
                  For{" "}
                  <span className="text-blue-500">{searchParams.get("a")}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Show rows:
                <select
                  className="ml-2 border rounded p-1"
                  value={perPage}
                  onChange={handlePerPageChange}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
                  <th className="p-3 whitespace-nowrap">Transaction Hash</th>
                  <th className="p-3 whitespace-nowrap">Method</th>
                  <th className="p-3 whitespace-nowrap">Age</th>
                  <th className="p-3 whitespace-nowrap">From</th>
                  <th className="p-3 whitespace-nowrap">To</th>
                  <th className="p-3 whitespace-nowrap text-right">Amount</th>
                  <th className="p-3 whitespace-nowrap text-right">Gas Fee</th>
                </tr>
              </thead>
              <tbody>
                {txData.transactions.map((tx) => (
                  <tr
                    key={tx.transactionHash}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faFileAlt}
                          className="text-gray-400"
                        />
                        <Link
                          href={`/tx/${tx.transactionHash}`}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          {tx.transactionHash.slice(0, 12)}...
                        </Link>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">
                      {tx.method || "Transfer"}
                    </td>
                    <td className="p-3 text-gray-500">
                      {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/address/${tx.fromAddress}`}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {formatAddress(tx.fromAddress)}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/address/${tx.toAddress}`}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {formatAddress(tx.toAddress)}
                      </Link>
                    </td>
                    <td className="p-3 text-right">
                      {tx.amount}{" "}
                      {tx.method === "Token Created" ? "DFS" : tx.token.symbol}
                    </td>
                    <td className="p-3 text-right">{tx.gasFee} DFS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={txData.currentPage}
          totalPages={Math.ceil(txData.total / txData.perPage)}
          basePath="/txs"
          queryParams={
            searchParams.get("a") ? { a: searchParams.get("a")! } : undefined
          }
        />

        {/* Info Text */}
        <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
          <span className="mr-1">ℹ️</span>A transaction is a cryptographically
          signed instruction that changes the blockchain state. Block explorers
          track the details of all transactions in the network.{" "}
          <Link
            href="/knowledge-base"
            className="text-blue-500 hover:text-blue-600"
          >
            Learn more about transactions in our Knowledge Base
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return <TransactionsContent />;
}
