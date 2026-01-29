"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Block, Transaction } from "@/src/types";
import { getLatestBlocks, getLatestTransactions } from "@/src/lib/firebase";
import { formatTimeAgo, shortenHash } from "@/src/lib/utils";
import CustomizeCardModal from "./CustomizeCardModal";

type ViewType = "transactions" | "blocks";

export default function SolscanTable() {
  const [viewType, setViewType] = useState<ViewType>("blocks");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (viewType === "transactions") {
        const txs = await getLatestTransactions();
        setTransactions(txs);
      } else {
        const blks = await getLatestBlocks();
        setBlocks(blks);
      }
      setLoading(false);
    };
    fetchData();
  }, [viewType]);

  const handleSave = (selection: ViewType) => {
    setViewType(selection);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden p-0 w-1/2">
        <div className="flex flex-col gap-4 items-start justify-start">
          {/* Header */}
          <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full px-4 pt-4">
            <div className="text-[15px] leading-[24px] font-medium text-gray-900">
              {viewType === "transactions" ? "Latest Transactions" : "Latest Blocks"}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none items-center justify-center font-bold transition-colors text-green-600 bg-white border border-green-600 hover:bg-gray-50 disabled:bg-white disabled:text-gray-400 disabled:border-gray-300 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-[6px] text-[12px] leading-2 px-1 gap-1 h-7 flex rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-layout-grid"
              >
                <rect width="7" height="7" x="3" y="3" rx="1"></rect>
                <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                <rect width="7" height="7" x="14" y="14" rx="1"></rect>
                <rect width="7" height="7" x="3" y="14" rx="1"></rect>
              </svg>
              Customize
            </button>
          </div>

          {/* Table */}
          <div className="flex flex-col gap-0 items-stretch justify-start w-full h-full">
            <div className="h-full w-auto sm:w-full">
              <div className="relative overflow-hidden">
                <div className="h-full w-full rounded-[inherit] overflow-x-auto">
                  <div style={{ minWidth: "100%", display: "table" }}>
                    <table className="w-full border-separate caption-bottom border-spacing-0">
                      <thead className="sticky top-0 z-10">
                        <tr className="transition-colors bg-white border-b border-gray-200">
                          {viewType === "transactions" ? (
                            <>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4" style={{ minWidth: "45px", width: "45px" }}>
                                <div className="flex gap-2 flex-row items-center justify-between flex-wrap">
                                  <div className="flex gap-1 flex-row items-center justify-start flex-nowrap">
                                    <div className="flex gap-1 flex-row items-center justify-center flex-nowrap whitespace-nowrap font-normal h-6 w-6">
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
                                      >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <path d="M12 17h.01"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4" style={{ minWidth: "150px" }}>
                                Signature
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="flex gap-1 flex-row items-center justify-start flex-nowrap cursor-pointer">
                                  <div className="text-gray-900 text-[14px] leading-[24px] font-bold">Time</div>
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
                                    className="lucide lucide-clock text-[#2563eb]"
                                  >
                                    <path d="M12 6v6l4 2"></path>
                                    <circle cx="12" cy="12" r="10"></circle>
                                  </svg>
                                </div>
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4">
                                Block
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                Action
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4" style={{ minWidth: "150px" }}>
                                Epoch
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4">
                                Slot
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="flex gap-1 flex-row items-center justify-start flex-nowrap cursor-pointer">
                                  <div className="text-gray-900 text-[14px] leading-[24px] font-bold">Time</div>
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
                                    className="lucide lucide-clock text-[#2563eb]"
                                  >
                                    <path d="M12 6v6l4 2"></path>
                                    <circle cx="12" cy="12" r="10"></circle>
                                  </svg>
                                </div>
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4">
                                Transactions
                              </th>
                              <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                Leader
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child_td]:border-b-0">
                        {loading ? (
                          <tr>
                            <td colSpan={viewType === "transactions" ? 5 : 5} className="h-12 px-2 py-[10px] text-center text-gray-500">
                              Loading...
                            </td>
                          </tr>
                        ) : viewType === "transactions" ? (
                          transactions.slice(0, 8).map((tx, index) => (
                            <tr
                              key={tx.transactionHash}
                              className="transition-colors hover:bg-gray-50 bg-white border-b border-gray-200"
                            >
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <button
                                  type="button"
                                  className="px-1 border border-gray-200 rounded-md flex items-center justify-center cursor-pointer bg-white hover:bg-gray-100 transition-colors duration-200 py-1"
                                >
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
                                    className="text-gray-600"
                                  >
                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                </button>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="flex gap-1 flex-row items-center justify-start flex-nowrap max-w-[150px]">
                                  <Link
                                    href={`/tx/${tx.transactionHash}`}
                                    className="inline-block truncate text-[#2563eb] text-[14px] border-none hover:underline"
                                  >
                                    {shortenHash(tx.transactionHash)}
                                  </Link>
                                  <button
                                    onClick={() => copyToClipboard(tx.transactionHash)}
                                    className="inline-flex align-middle"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-copy cursor-pointer text-[#adb5bd] hover:text-[#2563eb]"
                                    >
                                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="inline-flex">
                                  <div className="font-normal text-gray-900 text-[14px] leading-[24px] max-w-[130px] truncate">
                                    {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                                  </div>
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                {tx.blockNumber ? (
                                  <Link href={`/block/${tx.blockNumber}`} className="text-[#2563eb] hover:underline">
                                    {tx.blockNumber}
                                  </Link>
                                ) : (
                                  <span className="text-gray-900">-</span>
                                )}
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                <div className="flex gap-1 flex-row items-center justify-start flex-nowrap">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="transition-colors flex-nowrap bg-gray-50 px-[6px] py-0 font-medium text-gray-900 text-[12px] leading-[16px] border border-gray-200 rounded-[6px] h-[20px] flex gap-1 items-center justify-center w-[110px] text-center">
                                      <div className="min-w-0">
                                        <div className="text-gray-900 text-[12px] font-medium min-w-0 flex-1 truncate">
                                          {tx.method || "Transfer"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          blocks.slice(0, 8).map((block) => (
                            <tr
                              key={block.number}
                              className="transition-colors hover:bg-gray-50 bg-white border-b border-gray-200"
                            >
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="font-normal text-gray-900 text-[14px] leading-[24px]">
                                  {Math.floor(block.number / 5000)}
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="font-normal text-gray-900 text-[14px] leading-[24px]">
                                  {block.number}
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="inline-flex">
                                  <div className="font-normal text-gray-900 text-[14px] leading-[24px] max-w-[130px] truncate">
                                    {formatTimeAgo(block.timestamp)}
                                  </div>
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4">
                                <div className="font-normal text-gray-900 text-[14px] leading-[24px]">
                                  {block.transactions || 0}
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                  <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate max-w-[200px]">
                                    <div className="inline">
                                      <span className="text-current">Validator</span>
                                    </div>
                                  </span>
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-4 border-t border-gray-200 bg-gray-50 w-full">
            <Link href={viewType === "transactions" ? "/txs" : "/blocks"} className="w-full">
              <div className="flex gap-1 flex-row items-center justify-center flex-wrap hover:text-[#2563eb] text-gray-500">
                <div className="text-[12px] leading-[16px] text-inherit font-medium transition-colors uppercase">
                  View All {viewType === "transactions" ? "Transactions" : "Blocks"}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-inherit transition-colors"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <CustomizeCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentSelection={viewType}
        onSave={handleSave}
      />
    </>
  );
}

