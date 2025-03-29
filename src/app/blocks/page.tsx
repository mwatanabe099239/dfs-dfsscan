"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/free-solid-svg-icons";
import { Block } from "@/src/types";
import { getNetworkStats, getBlocks } from "@/src/lib/firebase";
import { formatTimeAgo } from "@/src/lib/utils";
import Pagination from "@/src/components/common/Pagination";

interface BlocksData {
  total: number;
  perPage: number;
  currentPage: number;
  blocks: Block[];
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
            <th className="p-3 whitespace-nowrap">Block</th>
            <th className="p-3 whitespace-nowrap">Age</th>
            <th className="p-3 whitespace-nowrap">Txn</th>
            <th className="p-3 whitespace-nowrap">Gas Fee (DFS)</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="text-gray-200">
                    <FontAwesomeIcon icon={faCube} className="w-4 h-4" />
                  </div>
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </td>
              <td className="p-3">
                <div className="w-24 h-3 bg-gray-200 rounded" />
              </td>
              <td className="p-3">
                <div className="w-8 h-3 bg-gray-200 rounded" />
              </td>
              <td className="p-3">
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlocksContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [blocksData, setBlocksData] = useState<BlocksData>({
    total: 0,
    perPage: 10,
    currentPage: page,
    blocks: [],
  });

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      const { latestBlock } = await getNetworkStats();
      const total = latestBlock + 1; // Including genesis block

      const blocks = await getBlocks(page, perPage);

      setBlocksData({
        total,
        perPage,
        currentPage: page,
        blocks,
      });
      setLoading(false);
    };

    fetchBlocks();
  }, [page, perPage]);

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(event.target.value);
    setPerPage(newPerPage);
  };

  return (
    <div className="container mx-auto px-4 space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-md">Blocks</h2>
              <span className="text-sm text-gray-500">
                Total of {blocksData.total.toLocaleString()} blocks
              </span>
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
                  <th className="p-3 whitespace-nowrap">Block</th>
                  <th className="p-3 whitespace-nowrap">Age</th>
                  <th className="p-3 whitespace-nowrap">Txn</th>
                  <th className="p-3 whitespace-nowrap">Gas Fee (DFS)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {blocksData.blocks.map((block) => (
                  <tr
                    key={block.number}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faCube}
                          className="text-gray-400"
                        />
                        <span className="text-black">{block.number}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">
                      {formatTimeAgo(block.timestamp)}
                    </td>
                    <td className="p-3">{block.transactions}</td>
                    <td className="p-3">{block.transactions} DFS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Replace the pagination section with the new component */}
        <Pagination
          currentPage={blocksData.currentPage}
          totalPages={Math.ceil(blocksData.total / blocksData.perPage)}
          basePath="/blocks"
        />

        {/* Info Text */}
        {/* <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
          <span className="mr-1">ℹ️</span>A block is a container of
          transactions. Block explorers track the details of all blocks in the
          network.{" "}
          <Link
            href="/knowledge-base"
            className="text-[#0784c3] hover:text-blue-600"
          >
            Learn more about blocks in our Knowledge Base
          </Link>
          .
        </div> */}
      </div>
    </div>
  );
}

export default function Blocks() {
  return <BlocksContent />;
}
