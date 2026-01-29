import Link from "next/link";
import { Transaction } from "@/src/types";
import { formatTimeAgo, shortenAddress, shortenHash } from "@/src/lib/utils";
import { Copy, MoveRight, Eye, HelpCircle, Funnel, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TokenTransactions({
  transactions,
  address,
  totalCount,
  hideHeader = false,
  columnOrder,
  columnVisibility,
  isSolanaScan = false,
}: {
  transactions: Transaction[];
  address: string;
  totalCount: number;
  hideHeader?: boolean;
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
  isSolanaScan?: boolean;
}) {
  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast.success("Copied!");
  };

  const isTokenTransfer = address.startsWith("drc20_0x");

  const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";

  // Column definitions for SolanaScan
  const columnMap: Record<string, { label: string; key: string }> = {
    preview: { label: "", key: "preview" },
    signature: { label: "Transaction Hash", key: "signature" },
    block: { label: "Block", key: "block" },
    time: { label: "Time", key: "time" },
    action: { label: "Action", key: "action" },
    instructions: { label: "Instructions", key: "instructions" },
    by: { label: "By", key: "by" },
    value: { label: "Value", key: "value" },
    fee: { label: "Fee (DFS)", key: "fee" },
  };

  // Get visible columns in order
  const getVisibleColumns = () => {
    if (!isSolanaScan || !columnOrder || !columnVisibility) {
      return [];
    }
    return columnOrder.filter((key) => columnVisibility[key]);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (isSolanaScan) {
    const visibleColumns = getVisibleColumns();
    
    return (
      <div style={{ minWidth: "100%", display: "table" }}>
        <table className="w-full border-separate caption-bottom border-spacing-0">
          <thead className="sticky top-0 [&_tr]:border-b z-10">
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
                        {columnKey !== "preview" && columnKey !== "action" && columnKey !== "by" && columnKey !== "value" && columnKey !== "programs" && (
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
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {transactions.map((tx, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-gray-50 data-[state=selected]:bg-muted bg-white"
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
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {columnKey === "signature" && (
                        <div className="flex gap-1 flex-row items-center justify-start flex-nowrap max-w-[150px]">
                          <Link
                            href={`/tx/${tx.transactionHash}`}
                            className="inline-block truncate text-blue-600 hover:text-blue-700 text-[14px] border-none"
                          >
                            {tx.transactionHash}
                          </Link>
                          <button
                            onClick={() => handleCopy(tx.transactionHash)}
                            className="inline-flex align-middle"
                          >
                            <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-link-500" />
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
                              <span>{shortenAddress(tx.fromAddress)}</span>
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
                          {tx.token?.logoUrl ? (
                            <img
                              src={tx.token.logoUrl}
                              alt={tx.token.symbol || "Token"}
                              className="w-3.5 h-3.5 rounded-full"
                            />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
                          )}
                          <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px]">
                            <span>{tx.amount || "0"} {tx.token?.symbol || (tx.method === "Transfer" ? "DFS" : "DFS")}</span>
                          </div>
                        </div>
                      )}
                      {columnKey === "fee" && (
                        <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px]">
                          <span>{tx.gasFee || "0"} DFS</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      {!hideHeader && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Latest {transactions.length > 25 ? "25" : transactions.length}{" "}
              Transactions from a total of{" "}
            </span>
            <span className="text-[#0784c3]">{totalCount.toLocaleString()}</span>
            <span>transactions</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
              <th className="p-3 whitespace-nowrap">Transaction Hash</th>
              <th className="p-3 whitespace-nowrap">Method</th>
              <th className="p-3 whitespace-nowrap">Block</th>
              <th className="p-3 whitespace-nowrap">Age</th>
              <th className="p-3 whitespace-nowrap">From</th>
              <th className="p-3 whitespace-nowrap"></th>
              <th className="p-3 whitespace-nowrap">To</th>
              <th className="p-3 whitespace-nowrap">Amount</th>
              <th className="p-3 whitespace-nowrap">Gas Fee</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((tx, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 text-left"
              >
                <td className="p-3 flex items-center gap-2">
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
                </td>
                <td className="p-3">
                  <span className="bg-gray-50 border-gray-200 border text-xs px-2 py-1 rounded">
                    {tx.method || "Transfer"}
                  </span>
                </td>
                <td className="p-3 text-[#0784c3]">{tx.blockNumber}</td>
                <td className="p-3">
                  {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                </td>
                <td className="p-3 flex items-center gap-2">
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
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(tx.fromAddress)}
                      />
                    </>
                  )}
                </td>
                <td className="p-3">
                  {isTokenTransfer ? (
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
                <td className="p-3 flex items-center gap-2">
                  {tx.method === "Token Created" ? (
                    <>
                      <Link
                        href={`/address/${tx.fromAddress}`}
                        className="text-[#0784c3] hover:text-blue-600"
                      >
                        {shortenAddress(tx.fromAddress)}
                      </Link>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(tx.fromAddress)}
                      />
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/address/${tx.toAddress}`}
                        className="text-[#0784c3] hover:text-blue-600"
                      >
                        {shortenAddress(tx.toAddress)}
                      </Link>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(tx.toAddress)}
                      />
                    </>
                  )}
                </td>
                <td className="p-3">
                  {tx.amount}{" "}
                  {tx.method === "Transfer" ? tx.token?.symbol || "DFS" : "DFS"}
                </td>
                <td className="p-3 text-gray-600 text-xs">{tx.gasFee} DFS</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 text-center text-sm">
        <Link
          href={`/txs?a=${address}`}
          className="text-[#0784c3] hover:text-blue-600 flex items-center justify-center gap-2"
        >
          VIEW ALL TRANSACTIONS
          <span className="text-xs">→</span>
        </Link>
      </div>
    </>
  );
}
