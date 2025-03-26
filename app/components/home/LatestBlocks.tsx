'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube } from '@fortawesome/free-solid-svg-icons'
import { Block } from '../../types'
import { getLatestBlocks } from '../../lib/firebase'
import { formatTimeAgo } from '../../lib/utils'
import ItemSkeleton from '../common/ItemSkeleton'

export default function LatestBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="divide-y divide-gray-200">
        {[...Array(6)].map((_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 text-sm">
      {blocks.map((block) => (
        <div key={block.number} className="p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">
              <FontAwesomeIcon icon={faCube} className="w-6 h-6!" />
            </div>
            <div className="min-w-[180px]">
              <Link 
                href={`/block/${block.number}`}
                className="text-blue-500 hover:text-blue-600 block"
              >
                {block.number}
              </Link>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(block.timestamp)}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500">
                {block.transactions} txns <span className="mx-1">in</span> 5 mins
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="bg-transparent border border-gray-300 text-black py-1 px-2 rounded-md text-xs">
                {block.reward} DFS
              </span>
            </div>
          </div>
        </div>
      ))}
      <div className="p-4 text-center border-t border-gray-200 bg-gray-50">
        <Link 
          href="/blocks" 
          className="text-grey-100 hover:text-blue-600 uppercase text-sm"
        >
          View All Blocks →
        </Link>
      </div>
    </div>
  )
} 