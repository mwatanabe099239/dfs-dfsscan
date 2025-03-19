'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'

interface TransactionProps {
  hash: string
  timestamp: number
  from: string
  to: string
  value: number
}

export default function LatestTransactions({ transactions }: { transactions: TransactionProps[] }) {
  
  const timeNow = Math.floor(Date.now() / 1000)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((tx) => (
        <div key={tx.hash} className="p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">
              <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5" />
            </div>
            <div className="min-w-[120px]">
              <Link 
                href={`/tx/${tx.hash}`}
                className="text-blue-500 hover:text-blue-600 block"
              >
                {tx.hash.slice(0, 12)}...
              </Link>
              <span className="text-sm text-gray-500">
                {Math.floor(timeNow - tx.timestamp)} secs ago
              </span>
            </div>
            <div className="flex-1">
              <div>
                <span className="text-gray-500">From </span>
                <Link 
                  href={`/address/${tx.from}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {formatAddress(tx.from)}
                </Link>
              </div>
              <div>
                <span className="text-gray-500">To </span>
                <Link 
                  href={`/address/${tx.to}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {formatAddress(tx.to)}
                </Link>
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded text-sm">
                {tx.value} BNB
              </span>
            </div>
          </div>
        </div>
      ))}
      <div className="p-4 text-center border-t">
        <Link 
          href="/txs" 
          className="text-blue-500 hover:text-blue-600 uppercase text-sm"
        >
          View All Transactions →
        </Link>
      </div>
    </div>
  )
} 