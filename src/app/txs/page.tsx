"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Transaction } from "@/src/types";
import {
  getAddressTotalTransactionWithPagination,
  getTokenTotalTransactionWithPagination,
  getTransactionsWithPagination,
} from "@/src/lib/firebase";
import { formatTimeAgo, shortenAddress, shortenHash } from "@/src/lib/utils";
import Pagination from "@/src/components/common/Pagination";
import { Copy, MoveRight } from "lucide-react";
import { toast } from "react-hot-toast";

// Types
interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

interface NetworkStats {
  total24h: number;
  networkFee24h: string;
  avgTxnFee24h: string;
}

interface TransactionData {
  total: number;
  perPage: number;
  currentPage: number;
  transactions: Transaction[];
}

// Components
const StatsCard = ({ title, value, suffix = "" }: StatsCardProps) => (
  <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
    <div className="text-sm text-gray-700 mb-1 font-thin">{title}</div>
    <div className="text-md font-medium">
      {typeof value === "number" ? value.toLocaleString() : value}
      {suffix && ` ${suffix}`}
    </div>
  </div>
);

const TableHeader = () => (
  <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
    <th className="p-3 whitespace-nowrap">Transaction Hash</th>
    <th className="p-3 whitespace-nowrap">Method</th>
    <th className="p-3 whitespace-nowrap">Age</th>
    <th className="p-3 whitespace-nowrap">From</th>
    <th className="p-3 whitespace-nowrap"></th>
    <th className="p-3 whitespace-nowrap">To</th>
    <th className="p-3 whitespace-nowrap">Amount</th>
    <th className="p-3 whitespace-nowrap">Gas Fee</th>
  </tr>
);

const TransactionRow = ({
  tx,
  isLast,
  address,
}: {
  tx: Transaction;
  isLast: boolean;
  address: string | null | undefined;
}) => {
  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast.success("Copied!");
  };

  const isTotalTx = !address;
  const isTokenTx = address?.startsWith("drc20_0x");

  const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";

  return (
    <tr
      className={`${
        !isLast ? "border-b border-gray-200" : ""
      } hover:bg-gray-50`}
    >
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/tx/${tx.transactionHash}`}
            className="text-[#0784c3] hover:text-blue-600"
          >
            {shortenHash(tx.transactionHash)}
          </Link>
          <Copy
            className="w-4 h-4 text-gray-500 cursor-pointer"
            onClick={() => handleCopyTx(tx.transactionHash)}
          />
        </div>
      </td>
      <td className="p-3">
        <span className="bg-gray-50 border-gray-200 border text-xs px-2 py-1 rounded">
          {tx.method || "Transfer"}
        </span>
      </td>
      <td className="p-3">{formatTimeAgo(tx.createdAt.getTime() / 1000)}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {tx.method === "Token Created" ? (
            <>
              <Link
                href={`/address/${ZERO_ADDRESS}`}
                className="text-[#0784c3] hover:text-blue-600"
              >
                {shortenAddress(ZERO_ADDRESS)}
              </Link>
              <Copy
                className="w-4 h-4 text-gray-500 cursor-pointer"
                onClick={() => handleCopyTx(ZERO_ADDRESS)}
              />
            </>
          ) : (
            <>
              <Link
                href={`/address/${tx.fromAddress}`}
                className="text-[#0784c3] hover:text-blue-600"
              >
                {shortenAddress(tx.fromAddress)}
              </Link>
              {tx.fromAddress && (
                <Copy
                  className="w-4 h-4 text-gray-500 cursor-pointer"
                  onClick={() => handleCopyTx(tx.fromAddress)}
                />
              )}
            </>
          )}
        </div>
      </td>
      <td className="p-3">
        {isTotalTx || isTokenTx ? (
          <div className="bg-[#00a18610] border border-[#00a18630] rounded-full text-center h-6 w-6 flex items-center justify-center">
            <MoveRight className="w-4 h-auto text-[#00a186]" />
          </div>
        ) : (
          <>
            {address === tx.fromAddress ? (
              <div className="bg-[#cc9a0610] border border-[#cc9a0630] text-[#cc9a06] flex items-center justify-center h-6 w-10 text-center rounded-md text-[10px] font-medium">
                OUT
              </div>
            ) : (
              <div className="bg-[#00a18610] border border-[#00a18630] text-[#00a186] flex items-center justify-center h-6 w-10 text-center rounded-md text-[10px] font-medium">
                IN
              </div>
            )}
          </>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/address/${
              tx.method === "Token Created" ? tx.fromAddress : tx.toAddress
            }`}
            className="text-[#0784c3] hover:text-blue-600"
          >
            {shortenAddress(
              tx.method === "Token Created" ? tx.fromAddress : tx.toAddress
            )}
          </Link>
          <Copy
            className="w-4 h-4 text-gray-500 cursor-pointer"
            onClick={() =>
              handleCopyTx(
                tx.method === "Token Created" ? tx.fromAddress : tx.toAddress
              )
            }
          />
        </div>
      </td>
      <td className="p-3">
        {tx.amount} {tx.method === "Token Created" ? "DFS" : tx.token.symbol}
      </td>
      <td className="p-3 text-gray-600 text-xs">{tx.gasFee} DFS</td>
    </tr>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse">
    <table className="w-full">
      <thead>
        <TableHeader />
      </thead>
      <tbody>
        {[...Array(10)].map((_, i) => (
          <tr key={i} className="border-b border-gray-200">
            {[...Array(7)].map((_, j) => (
              <td key={j} className="p-3">
                <div className={`h-4 bg-gray-200 rounded w-32`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1");
  const addressFilter = searchParams.get("a");

  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NetworkStats>({
    total24h: 0,
    networkFee24h: "0",
    avgTxnFee24h: "1.00",
  });
  const [txData, setTxData] = useState<TransactionData>({
    total: 0,
    perPage: 10,
    currentPage: page,
    transactions: [],
  });
  const isTokenAddress = addressFilter?.startsWith("drc20");

  const queryParams = useMemo(
    () => (addressFilter ? { a: addressFilter } : undefined),
    [addressFilter]
  );

  const changePerPage = (newPerPage: number) => {
    setPerPage(newPerPage);
    setTxData({
      ...txData,
      perPage: newPerPage,
      currentPage: 1,
    });
    const href = getPageUrl(1, queryParams || {});
    router.push(`${href}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ transactions, total: totalTransactions }] = await Promise.all([
          !addressFilter
            ? getTransactionsWithPagination(page, perPage)
            : isTokenAddress
            ? getTokenTotalTransactionWithPagination(
                addressFilter || "",
                page,
                perPage
              )
            : getAddressTotalTransactionWithPagination(
                addressFilter || "",
                page,
                perPage
              ),
        ]);

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last24hTxs = transactions.filter(
          (tx) => tx.createdAt > oneDayAgo
        );

        setStats({
          total24h: last24hTxs.length,
          networkFee24h: last24hTxs.length.toString(),
          avgTxnFee24h: "1.00",
        });

        setTxData({
          total: totalTransactions,
          perPage,
          currentPage: page,
          transactions,
        });
      } catch (error) {
        console.error("Failed to fetch transaction data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, perPage]);

  const getPageUrl = (page: number, queryParams: Record<string, string>) => {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const pageQuery = `page=${page}`;
    return `/txs?${pageQuery}${queryString ? `&${queryString}` : ""}`;
  };

  return (
    <div className="container mx-auto px-4 space-y-4">
      {!addressFilter && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="TRANSACTIONS (24H)" value={stats.total24h} />
          <StatsCard
            title="NETWORK TRANSACTIONS FEE (24H)"
            value={stats.networkFee24h}
            suffix="DFS"
          />
          <StatsCard
            title="AVG. TRANSACTION FEE (24H)"
            value={stats.avgTxnFee24h}
            suffix="DFS"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-md">Transactions</h2>
              {addressFilter && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">For</span>
                  <Link
                    href={`/address/${addressFilter}`}
                    className="text-[#0784c3]"
                  >
                    {addressFilter}
                  </Link>
                </div>
              )}
            </div>
            <select
              className="border rounded p-1 text-sm"
              value={perPage}
              onChange={(e) => changePerPage(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value} rows
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full">
              <thead>
                <TableHeader />
              </thead>
              <tbody className="text-sm">
                {txData.transactions.map((tx, index) => (
                  <TransactionRow
                    key={index}
                    tx={tx}
                    isLast={index === txData.transactions.length - 1}
                    address={addressFilter}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={txData.currentPage}
          totalPages={Math.ceil(txData.total / txData.perPage)}
          basePath="/txs"
          queryParams={queryParams}
        />
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return <TransactionsContent />;
}
