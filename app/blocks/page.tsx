'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube } from '@fortawesome/free-solid-svg-icons'
import { Block } from '../types'
import { getNetworkStats, getLatestBlocks, getBlocks } from '../lib/firebase'
import { formatTimeAgo } from '../lib/utils'
import { Suspense } from 'react'
import Pagination from '../components/common/Pagination'

interface BlocksData {
  total: number
  perPage: number
  currentPage: number
  blocks: Block[]
}

function BlocksContent() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const [perPage, setPerPage] = useState(10)
  const [blocksData, setBlocksData] = useState<BlocksData>({
    total: 0,
    perPage: 10,
    currentPage: page,
    blocks: []
  })

  useEffect(() => {
    const fetchBlocks = async () => {
      const { latestBlock } = await getNetworkStats();
      const total = latestBlock + 1; // Including genesis block
      
      const blocks = await getBlocks(page, perPage);
      
      setBlocksData({
        total,
        perPage,
        currentPage: page,
        blocks
      });
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
              <h2 className="text-lg">Blocks</h2>
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
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
                <th className="p-3 whitespace-nowrap">Block</th>
                <th className="p-3 whitespace-nowrap">Age</th>
                <th className="p-3 whitespace-nowrap text-right">Txn</th>
                <th className="p-3 whitespace-nowrap text-right">Gas Fee (DFS)</th>
              </tr>
            </thead>
            <tbody>
              {blocksData.blocks.map((block) => (
                <tr key={block.number} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCube} className="text-gray-400" />
                      <Link href={`/block/${block.number}`} className="text-blue-500 hover:text-blue-600">
                        {block.number}
                      </Link>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500">{formatTimeAgo(block.timestamp)}</td>
                  <td className="p-3 text-right">{block.transactions}</td>
                  <td className="p-3 text-right">{block.transactions} DFS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Replace the pagination section with the new component */}
        <Pagination 
          currentPage={blocksData.currentPage}
          totalPages={Math.ceil(blocksData.total / blocksData.perPage)}
          basePath="/blocks"
        />

        {/* Info Text */}
        <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
          <span className="mr-1">ℹ️</span>
          A block is a container of transactions. Block explorers track the details of all blocks in the network.{' '}
          <Link href="/knowledge-base" className="text-blue-500 hover:text-blue-600">
            Learn more about blocks in our Knowledge Base
          </Link>
          .
        </div>
      </div>
    </div>
  )
}

function BlocksLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function Blocks() {
  return (
    <Suspense fallback={<BlocksLoading />}>
      <BlocksContent />
    </Suspense>
  )
} 