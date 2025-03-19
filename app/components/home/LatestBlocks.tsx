'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube } from '@fortawesome/free-solid-svg-icons'

interface BlockProps {
  number: number
  timestamp: number
  transactions: number
  validator: string
  validatorAddress: string
  reward: number
}

export default function LatestBlocks({ blocks }: { blocks: BlockProps[] }) {
  const timeNow = Math.floor(Date.now() / 1000)

  return (
    <div className="divide-y divide-gray-200">
      {blocks.map((block) => (
        <div key={block.number} className="p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">
              <FontAwesomeIcon icon={faCube} className="w-5 h-5" />
            </div>
            <div className="min-w-[120px]">
              <Link 
                href={`/block/${block.number}`}
                className="text-blue-500 hover:text-blue-600 block"
              >
                {block.number}
              </Link>
              <span className="text-sm text-gray-500">
                {Math.floor(timeNow - block.timestamp)} secs ago
              </span>
            </div>
            <div className="flex-1">
              <span className="text-gray-500">Validated By </span>
              <Link 
                href={`/address/${block.validatorAddress}`}
                className="text-blue-500 hover:text-blue-600"
              >
                {block.validator}
              </Link>
              <div className="text-sm text-gray-500">
                {block.transactions} txns <span className="mx-1">in</span> {3} secs
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded text-sm">
                {block.reward} BNB
              </span>
            </div>
          </div>
        </div>
      ))}
      <div className="p-4 text-center border-t">
        <Link 
          href="/blocks" 
          className="text-blue-500 hover:text-blue-600 uppercase text-sm"
        >
          View All Blocks →
        </Link>
      </div>
    </div>
  )
} 