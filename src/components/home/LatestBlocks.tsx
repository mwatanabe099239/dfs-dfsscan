"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/free-solid-svg-icons";
import { Block } from "@/src/types";
import { getLatestBlocks } from "@/src/lib/firebase";
import { formatTimeAgo } from "@/src/lib/utils";
import ItemSkeleton from "@/src/components/common/ItemSkeleton";
import { useViewMode } from "@/src/contexts/ViewModeContext";

export default function LatestBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useViewMode();
  const isSolanaMode = viewMode === "solanascan";

  useEffect(() => {
    const fetchBlocks = async () => {
      const blocksData = await getLatestBlocks();
      setBlocks(blocksData);
      setLoading(false);
    };
    fetchBlocks();
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
            href="/blocks"
            className={`uppercase text-xs ${isSolanaMode ? "text-gray-300 hover:text-white" : "text-grey-300 hover:text-[#0784c3]"}`}
          >
            View All Blocks →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[90%]">
      <div className={`divide-y text-sm flex-1 ${isSolanaMode ? "divide-gray-700" : "divide-gray-200"}`}>
        {blocks.map((block) => (
          <div key={block.number} className={`p-4 ${isSolanaMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
            <div className="flex items-center gap-3">
              <div className={isSolanaMode ? "text-gray-500" : "text-gray-400"}>
                <FontAwesomeIcon icon={faCube} className="w-6 h-6!" />
              </div>
              <div className="min-w-[180px]">
                <span className={`block ${isSolanaMode ? "text-gray-200" : "text-black"}`}>{block.number}</span>
                <span className={`text-xs ${isSolanaMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formatTimeAgo(block.timestamp)}
                </span>
              </div>
              <div className="flex-1">
                <div className={`text-xs ${isSolanaMode ? "text-gray-400" : "text-gray-500"}`}>
                  {block.transactions} txns <span className="mx-1">in</span> 5
                  mins
                </div>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className={`bg-transparent border py-1 px-2 rounded-md text-xs ${
                  isSolanaMode 
                    ? "border-gray-600 text-gray-300" 
                    : "border-gray-300 text-black"
                }`}>
                  {block.reward} DFS
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`p-4 text-center mt-auto ${isSolanaMode ? "bg-gray-700" : "bg-gray-50"}`}>
        <Link
          href="/blocks"
          className={`uppercase text-xs ${isSolanaMode ? "text-gray-300 hover:text-[#9945FF]" : "text-grey-300 hover:text-[#0784c3]"}`}
        >
          View All Blocks →
        </Link>
      </div>
    </div>
  );
}
