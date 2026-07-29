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
import {
  formatNumber,
  formatTimeAgo,
  formatTxValue,
  isNftTransferTx,
  shortenAddress,
  shortenHash,
} from "@/src/lib/utils";
import Pagination from "@/src/components/common/Pagination";
import { Copy, Download, MoveRight, Eye, HelpCircle, Funnel, Clock, GripVertical, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { ZERO_ADDRESS } from "@/src/lib/constant";
import { SponsorTitle } from "../address/[address]/AddressContent";
import { useViewMode } from "@/src/contexts/ViewModeContext";
import SearchBar from "@/src/components/SearchBar";
import Image from "next/image";
import AddressDisplay from "@/src/components/common/AddressDisplay";

// Types
interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  isSolanaScan?: boolean;
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
const StatsCard = ({ title, value, suffix = "", isSolanaScan = false }: StatsCardProps) => {
  if (isSolanaScan) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs text-gray-500 mb-1 font-normal">{title}</div>
        <div className="text-lg font-semibold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix && ` ${suffix}`}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-sm text-gray-700 mb-1 font-thin">{title}</div>
      <div className="text-md font-medium">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && ` ${suffix}`}
      </div>
    </div>
  );
};

// BSCScan Components
const BSCScanTableHeader = () => (
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

const BSCScanTransactionRow = ({
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
              <AddressDisplay
                address={tx.fromAddress}
                className="text-[#0784c3] hover:text-blue-600"
              />
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
          <div className="bg-[#21f20110] border border-[#21f20130] rounded-full text-center h-6 w-6 flex items-center justify-center">
            <MoveRight className="w-4 h-auto text-[#21f201]" />
          </div>
        ) : (
          <>
            {address === tx.fromAddress ? (
              <div className="bg-[#cc9a0610] border border-[#cc9a0630] text-[#cc9a06] flex items-center justify-center h-6 w-10 text-center rounded-md text-[10px] font-medium">
                OUT
              </div>
            ) : (
              <div className="bg-[#21f20110] border border-[#21f20130] text-[#21f201] flex items-center justify-center h-6 w-10 text-center rounded-md text-[10px] font-medium">
                IN
              </div>
            )}
          </>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <AddressDisplay
            address={
              tx.method === "Token Created" ? tx.fromAddress : tx.toAddress
            }
            className="text-[#0784c3] hover:text-blue-600"
          />
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
      <td className="p-3">{formatTxValue(tx)}</td>
      <td className="p-3 text-gray-600 text-xs">{formatNumber(Number(tx.gasFee), 6)} DFS</td>
    </tr>
  );
};

// SolanaScan Components
const SolanaScanTableHeader = ({
  columnOrder,
  columnVisibility,
}: {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
}) => {
  const columnMap: Record<string, { label: string; key: string }> = {
    preview: { label: "", key: "preview" },
    signature: { label: "Transaction Hash", key: "signature" },
    block: { label: "Block", key: "block" },
    time: { label: "Time", key: "time" },
    action: { label: "Action", key: "action" },
    by: { label: "By", key: "by" },
    value: { label: "Value", key: "value" },
    fee: { label: "Fee (DFS)", key: "fee" },
  };

  const visibleColumns = columnOrder.filter((col) => columnVisibility[col]);

  return (
    <tr className="transition-colors data-[state=selected]:bg-muted bg-white">
      {visibleColumns.map((columnKey) => {
        const column = columnMap[columnKey];
        if (!column) return null;

        return (
          <th
            key={columnKey}
            className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-700 [&:has([role=checkbox])]:pr-0 border-b border-gray-200 first:pl-4 last:pr-4 bg-white"
            style={{
              minWidth: columnKey === "preview" ? "50px" : columnKey === "signature" ? "150px" : columnKey === "value" ? "140px" : "20px",
              width: "unset",
            }}
          >
            <div className="flex gap-2 flex-row items-center justify-between flex-wrap">
              <div className="flex gap-1 flex-row items-center justify-start flex-nowrap">
                {columnKey === "preview" ? (
                  <div className="flex gap-1 flex-row items-center justify-center flex-nowrap whitespace-nowrap font-normal h-6 w-6">
                    <div className="inline-flex" data-state="closed">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                ) : columnKey === "time" ? (
                  <div className="flex gap-1 flex-row items-center justify-start flex-nowrap cursor-pointer">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">{column.label}</div>
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                ) : (
                  column.label
                )}
                {columnKey !== "preview" && columnKey !== "action" && columnKey !== "by" && columnKey !== "value" && columnKey !== "fee" && (
                  <button
                    type="button"
                    className="inline-flex cursor-pointer bg-inherit hover:bg-[#0000000a] border-none py-2 px-1 h-auto rounded-md relative"
                  >
                    <Funnel className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </th>
        );
      })}
    </tr>
  );
};

const SolanaScanTransactionRow = ({
  tx,
  address,
  columnOrder,
  columnVisibility,
}: {
  tx: Transaction;
  address: string | null | undefined;
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const columnMap: Record<string, { label: string; key: string }> = {
    preview: { label: "", key: "preview" },
    signature: { label: "Transaction Hash", key: "signature" },
    block: { label: "Block", key: "block" },
    time: { label: "Time", key: "time" },
    action: { label: "Action", key: "action" },
    by: { label: "By", key: "by" },
    value: { label: "Value", key: "value" },
    fee: { label: "Fee (DFS)", key: "fee" },
  };

  const visibleColumns = columnOrder.filter((col) => columnVisibility[col]);

  return (
    <tr
      className="transition-colors hover:bg-gray-100 data-[state=selected]:bg-muted bg-white"
      data-state="false"
    >
      {visibleColumns.map((columnKey) => {
        return (
          <td
            key={columnKey}
            className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-700 [&:has([role=checkbox])]:pr-0 border-b border-gray-200 first:pl-4 last:pr-4"
          >
            {columnKey === "preview" && (
              <button
                type="button"
                className="px-1 border border-gray-200 rounded-md flex items-center justify-center cursor-pointer bg-white hover:bg-gray-100 transition-colors duration-200 py-1"
              >
                <Eye className="w-3.5 h-3.5 text-gray-700" />
              </button>
            )}
            {columnKey === "signature" && (
              <div className="flex gap-1 flex-row items-center justify-start flex-nowrap max-w-[150px]">
                <Link
                  href={`/tx/${tx.transactionHash}`}
                  className="inline-block truncate text-blue-600 text-[14px] border-none"
                >
                  {tx.transactionHash}
                </Link>
                <button
                  onClick={() => handleCopy(tx.transactionHash)}
                  className="inline-flex align-middle"
                >
                  <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-blue-600" />
                </button>
              </div>
            )}
            {columnKey === "block" && (
              <Link href={`/block/${tx.blockNumber}`} className="text-blue-600 hover:text-blue-700">
                {tx.blockNumber}
              </Link>
            )}
            {columnKey === "time" && (
              <div className="inline-flex" data-state="closed">
                <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px] max-w-[130px] truncate">
                  {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                </div>
              </div>
            )}
            {columnKey === "action" && (
              <div className="flex items-center transition-colors flex-nowrap bg-gray-50 dark:bg-white px-[6px] py-0 font-medium text-gray-700 !text-[12px] !leading-[16px] border border-gray-200 rounded-[6px] h-[20px] text-[10px] leading-[20px] justify-center w-[110px] text-center">
                <div className="min-w-0 max-w-full">
                  <div className="min-w-0">
                    <div className="not-italic text-gray-700 text-[13px] leading-[16px] font-medium !text-[12px] max-w-[100px] truncate">
                      {tx.method || "Transfer"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {columnKey === "by" && (
              <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                <span className="align-middle font-normal text-gray-700 text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md autoTruncate max-w-[200px]">
                  <div className="inline" data-state="closed">
                    <AddressDisplay address={tx.fromAddress} link={false} />
                  </div>
                </span>
                <span className="inline-flex items-center ml-1 gap-2 align-middle">
                  <button
                    onClick={() => handleCopy(tx.fromAddress)}
                    className="inline-flex align-middle"
                  >
                    <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-blue-600" />
                  </button>
                </span>
              </span>
            )}
            {columnKey === "value" && (
              <div className="flex gap-2 flex-row items-center justify-start flex-nowrap">
                {isNftTransferTx(tx)
                  ? tx.nft?.imageUrl && (
                      <Image
                        src={tx.nft.imageUrl}
                        alt={tx.nft.symbol || tx.nft.name || "NFT"}
                        width={14}
                        height={14}
                        className="rounded-full h-3.5 w-3.5 object-cover"
                      />
                    )
                  : tx.token?.logoUrl && (
                      <Image
                        src={tx.token.logoUrl}
                        alt={tx.token.symbol || "token"}
                        width={14}
                        height={14}
                        className="rounded-full h-3.5 w-3.5 object-cover"
                      />
                    )}
                <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px]">
                  <span>{formatTxValue(tx)}</span>
                </div>
              </div>
            )}
            {columnKey === "fee" && (
              <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px]">
                <span>{formatNumber(Number(tx.gasFee), 6)}</span> DFS
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
};

const TableSkeleton = ({
  isSolanaScan = false,
  columnOrder,
  columnVisibility,
}: {
  isSolanaScan?: boolean;
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
}) => {
  const defaultColumnOrder = ["preview", "signature", "block", "time", "action", "by", "value", "fee"];
  const defaultColumnVisibility = {
    preview: true,
    signature: true,
    block: true,
    time: true,
    action: true,
    by: true,
    value: true,
    fee: true,
  };

  if (isSolanaScan) {
    return (
      <div className="animate-pulse">
        <div style={{ minWidth: "100%", display: "table" }}>
          <table className="w-full border-separate caption-bottom border-spacing-0">
            <thead className="sticky top-0 [&_tr]:border-b z-10">
              <SolanaScanTableHeader
                columnOrder={columnOrder || defaultColumnOrder}
                columnVisibility={columnVisibility || defaultColumnVisibility}
              />
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-gray-200">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="h-12 px-2 py-[10px] first:pl-4 last:pr-4">
                      <div className={`h-4 bg-gray-200 rounded w-32`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <BSCScanTableHeader />
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200">
              {[...Array(8)].map((_, j) => (
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
};

// BSCScan View
function BSCScanView({
  stats,
  txData,
  loading,
  addressFilter,
  queryParams,
  perPage,
  changePerPage,
}: {
  stats: NetworkStats;
  txData: TransactionData;
  loading: boolean;
  addressFilter: string | null;
  queryParams: Record<string, string> | undefined;
  perPage: number;
  changePerPage: (newPerPage: number) => void;
}) {
  return (
    <div className="container mx-auto px-4 space-y-4">
      {/* Header with address */}
      <div className="flex flex-col border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-lg">Transactions</h1>
        {addressFilter && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700">For</span>
            <AddressDisplay
              address={addressFilter}
              full
              className="text-[#0784c3]"
            />
          </div>
        )}
      </div>

      <div className="mb-10">
        <SponsorTitle />
      </div>

      {!addressFilter && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="TRANSACTIONS (24H)" value={stats.total24h} />
          <StatsCard
            title="DFS HOLDERS"
            value={stats.networkFee24h}
            suffix="DFS"
          />
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
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-2 w-full p-4">
              <h2 className="text-sm">
                A total of {txData.total} transactions found
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-xs text-gray-600 border border-gray-200 rounded-md px-2 py-1 cursor-pointer h-7">
                  <Download className="w-4 h-4" />
                  <span>Download Page Data</span>
                </button>
                <Pagination
                  currentPage={txData.currentPage}
                  totalPages={Math.ceil(txData.total / txData.perPage)}
                  basePath="/txs"
                  queryParams={queryParams}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full">
              <thead>
                <BSCScanTableHeader />
              </thead>
              <tbody className="text-sm">
                {txData.transactions.map((tx, index) => (
                  <BSCScanTransactionRow
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
        <div className="flex items-center justify-between gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show rows:</span>
            <select
              className="border border-gray-300 rounded-md p-1 text-sm outline-none"
              value={perPage}
              onChange={(e) => changePerPage(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <Pagination
            currentPage={txData.currentPage}
            totalPages={Math.ceil(txData.total / txData.perPage)}
            basePath="/txs"
            queryParams={queryParams}
          />
        </div>
      </div>
    </div>
  );
}

// SolanaScan View
function SolanaScanView({
  stats,
  txData,
  loading,
  addressFilter,
  queryParams,
  perPage,
  changePerPage,
}: {
  stats: NetworkStats;
  txData: TransactionData;
  loading: boolean;
  addressFilter: string | null;
  queryParams: Record<string, string> | undefined;
  perPage: number;
  changePerPage: (newPerPage: number) => void;
}) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const { viewMode } = useViewMode();

  // Default values
  const defaultColumnOrder = [
    "preview",
    "signature",
    "block",
    "time",
    "action",
    "by",
    "value",
    "fee",
  ];
  const defaultColumnVisibility = {
    preview: true,
    signature: true,
    block: false,
    time: true,
    action: true,
    by: true,
    value: true,
    fee: false,
  };

  // Load from localStorage or use defaults (lazy initializer)
  const loadColumnOrder = (): string[] => {
    if (typeof window === "undefined") {
      return defaultColumnOrder;
    }
    try {
      const savedOrder = localStorage.getItem("txsTableColumnOrder");
      return savedOrder ? JSON.parse(savedOrder) : defaultColumnOrder;
    } catch (error) {
      console.error("Error loading column order:", error);
      return defaultColumnOrder;
    }
  };

  const loadColumnVisibility = () => {
    if (typeof window === "undefined") {
      return defaultColumnVisibility;
    }
    try {
      const savedVisibility = localStorage.getItem("txsTableColumnVisibility");
      return savedVisibility ? JSON.parse(savedVisibility) : defaultColumnVisibility;
    } catch (error) {
      console.error("Error loading column visibility:", error);
      return defaultColumnVisibility;
    }
  };

  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>(loadColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibility);
  const [tempColumnVisibility, setTempColumnVisibility] = useState(loadColumnVisibility);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleResetColumns = () => {
    setTempColumnVisibility(defaultColumnVisibility);
    setTempColumnOrder(defaultColumnOrder);
  };

  const handleApplyColumns = () => {
    setColumnVisibility(tempColumnVisibility);
    setColumnOrder(tempColumnOrder);

    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("txsTableColumnOrder", JSON.stringify(tempColumnOrder));
        localStorage.setItem("txsTableColumnVisibility", JSON.stringify(tempColumnVisibility));
      } catch (error) {
        console.error("Error saving column settings:", error);
      }
    }

    setShowColumnMenu(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = [...tempColumnOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    setTempColumnOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`${viewMode === "solanascan" ? "mt-4" : ""} container mx-auto px-4 space-y-4`}>
      {/* Header with address */}
      <div className="flex flex-col border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
        {addressFilter && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm text-gray-600">For</span>
            <AddressDisplay
              address={addressFilter}
              full
              className="text-blue-600 hover:text-blue-700"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <SponsorTitle />
      </div>

      {!addressFilter && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard title="TRANSACTIONS (24H)" value={stats.total24h} isSolanaScan={true} />
          <StatsCard
            title="DFS HOLDERS"
            value={stats.networkFee24h}
            suffix="DFS"
            isSolanaScan={true}
          />
          <StatsCard
            title="NETWORK TRANSACTIONS FEE (24H)"
            value={stats.networkFee24h}
            suffix="DFS"
            isSolanaScan={true}
          />
          <StatsCard
            title="AVG. TRANSACTION FEE (24H)"
            value={stats.avgTxnFee24h}
            suffix="DFS"
            isSolanaScan={true}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-2 w-full p-4">
              <h2 className="text-sm font-medium text-gray-700">
                A total of {txData.total} transactions found
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 text-xs text-gray-600 border border-gray-200 rounded-md px-2 py-1 cursor-pointer h-7 hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  <span>Download Page Data</span>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setTempColumnVisibility(columnVisibility);
                      setTempColumnOrder(columnOrder);
                      setShowColumnMenu(!showColumnMenu);
                    }}
                    className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold h-auto transition-colors border border-gray-200 hover:bg-gray-100 text-gray-700 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-1.5 text-[12px] leading-[18px] gap-0.5 px-1.5 h-[28px] bg-gray-50"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Column Customization Dropdown */}
                  {showColumnMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowColumnMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-[280px]">
                        {/* Column List */}
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                          {tempColumnOrder.map((columnKey: string, index: number) => {
                            const columnMap: Record<string, string> = {
                              preview: "Preview",
                              signature: "Transaction Hash",
                              block: "Block",
                              time: "Time",
                              action: "Action",
                              by: "By",
                              value: "Value",
                              fee: "Fee (DFS)",
                            };
                            const column = { key: columnKey, label: columnMap[columnKey] };
                            const isDragging = draggedIndex === index;
                            const isDragOver = dragOverIndex === index;

                            return (
                              <div
                                key={column.key}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded cursor-move transition-colors ${
                                  isDragging ? "opacity-50" : ""
                                } ${isDragOver ? "bg-blue-50 border-t-2 border-blue-500" : ""}`}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={tempColumnVisibility[column.key as keyof typeof tempColumnVisibility]}
                                    onChange={(e) =>
                                      setTempColumnVisibility({
                                        ...tempColumnVisibility,
                                        [column.key]: e.target.checked,
                                      })
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-[#21f201] border-gray-300 rounded focus:ring-[#21f201] cursor-pointer"
                                  />
                                  <span className="text-sm text-gray-700">{column.label}</span>
                                </div>
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                              </div>
                            );
                          })}
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-200" />

                        {/* Action Buttons */}
                        <div className="p-4 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleResetColumns}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyColumns}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#21f201] hover:bg-[#1bd301] rounded-lg transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </>
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
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton
              isSolanaScan={true}
              columnOrder={columnOrder}
              columnVisibility={columnVisibility}
            />
          ) : (
            <div style={{ minWidth: "100%", display: "table" }}>
              <table className="w-full border-separate caption-bottom border-spacing-0">
                <thead className="sticky top-0 [&_tr]:border-b z-10">
                  <SolanaScanTableHeader
                    columnOrder={columnOrder}
                    columnVisibility={columnVisibility}
                  />
                </thead>
                <tbody className="[&_tr:last-child_td]:border-b-0">
                  {txData.transactions.map((tx, index) => (
                    <SolanaScanTransactionRow
                      key={index}
                      tx={tx}
                      address={addressFilter}
                      columnOrder={columnOrder}
                      columnVisibility={columnVisibility}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show rows:</span>
            <select
              className="border border-gray-300 rounded-md p-1 text-sm outline-none bg-white"
              value={perPage}
              onChange={(e) => changePerPage(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <Pagination
            currentPage={txData.currentPage}
            totalPages={Math.ceil(txData.total / txData.perPage)}
            basePath="/txs"
            queryParams={queryParams}
          />
        </div>
      </div>
    </div>
  );
}

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { viewMode } = useViewMode();
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
  }, [page, perPage, addressFilter, isTokenAddress]);

  const getPageUrl = (page: number, queryParams: Record<string, string>) => {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const pageQuery = `page=${page}`;
    return `/txs?${pageQuery}${queryString ? `&${queryString}` : ""}`;
  };

  const commonProps = {
    stats,
    txData,
    loading,
    addressFilter,
    queryParams,
    perPage,
    changePerPage,
  };

  if (viewMode === "solanascan") {
    return <SolanaScanView {...commonProps} />;
  }

  return <BSCScanView {...commonProps} />;
}

export default function TransactionsPage() {
  return <TransactionsContent />;
}
