'use client'

import { use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Helper function for consistent number formatting
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Mock data for transactions stats
const statsData = {
  total24h: {
    count: 5955503,
    change: -0.58
  },
  pending: {
    count: 320,
    label: 'Average'
  },
  networkFee24h: {
    amount: '2,253.65',
    unit: 'BNB',
    change: 14.83
  },
  avgTxnFee24h: {
    amount: '0.2342',
    unit: 'USD',
    change: 7.17
  }
}

// Mock transaction data
const mockTransactions = {
  total: 6956911460,
  perPage: 50,
  currentPage: 1,
  transactions: [
    {
      hash: '0x5fc08a2a87f...',
      method: 'Deposit',
      block: '47627512',
      age: '6 secs ago',
      from: {
        address: 'Validator : defbit',
        isContract: false
      },
      to: {
        address: 'BSC: Validator Set',
        isContract: true
      },
      amount: '0.06693624 BNB',
      fee: '0'
    },
    // ... add more transactions
  ]
}

export default function Transactions({ params }: { params: Promise<{ address?: string }> }) {
  const searchParams = useSearchParams()
  const address = searchParams.get('a')
  
  return (
    <div className="space-y-4">
      {/* Stats Cards - only show when no address filter */}
      {!address && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">TRANSACTIONS (24H)</div>
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-medium">{formatNumber(statsData.total24h.count)}</div>
              <div className={`text-sm ${statsData.total24h.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({statsData.total24h.change}%)
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">PENDING TRANSACTIONS (LAST 1H)</div>
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-medium">{statsData.pending.count}</div>
              <div className="text-sm text-gray-500">({statsData.pending.label})</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">NETWORK TRANSACTIONS FEE (24H)</div>
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-medium">{statsData.networkFee24h.amount} {statsData.networkFee24h.unit}</div>
              <div className={`text-sm ${statsData.networkFee24h.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({statsData.networkFee24h.change}%)
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">AVG. TRANSACTION FEE (24H)</div>
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-medium">{statsData.avgTxnFee24h.amount} {statsData.avgTxnFee24h.unit}</div>
              <div className={`text-sm ${statsData.avgTxnFee24h.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({statsData.avgTxnFee24h.change}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg">Transactions</h2>
              {address && (
                <span className="text-sm text-gray-500">
                  For <span className="text-blue-500">{address}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Show rows:
                <select 
                  className="ml-2 border rounded p-1"
                  defaultValue="50"
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
                <th className="p-3 whitespace-nowrap">Transaction Hash</th>
                <th className="p-3 whitespace-nowrap">Method</th>
                <th className="p-3 whitespace-nowrap">Block</th>
                <th className="p-3 whitespace-nowrap">Age</th>
                <th className="p-3 whitespace-nowrap">From</th>
                <th className="p-3 whitespace-nowrap">To</th>
                <th className="p-3 whitespace-nowrap text-right">Amount</th>
                <th className="p-3 whitespace-nowrap text-right">Txn Fee</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.transactions.map((tx, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/tx/${tx.hash}`} className="text-blue-500 hover:text-blue-600">
                      {tx.hash}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {tx.method}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/block/${tx.block}`} className="text-blue-500 hover:text-blue-600">
                      {tx.block}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-500">{tx.age}</td>
                  <td className="p-3">
                    <Link href={`/address/${tx.from.address}`} className="text-blue-500 hover:text-blue-600">
                      {tx.from.address}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link href={`/address/${tx.to.address}`} className="text-blue-500 hover:text-blue-600">
                      {tx.to.address}
                    </Link>
                  </td>
                  <td className="p-3 text-right">{tx.amount}</td>
                  <td className="p-3 text-right">{tx.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {mockTransactions.currentPage} of {Math.ceil(mockTransactions.total / mockTransactions.perPage)}
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/txs?page=1${address ? `&a=${address}` : ''}`}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              First
            </Link>
            <Link 
              href={`/txs?page=${mockTransactions.currentPage - 1}${address ? `&a=${address}` : ''}`}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              ‹
            </Link>
            <span className="px-3 py-1">
              Page {mockTransactions.currentPage} of {Math.ceil(mockTransactions.total / mockTransactions.perPage)}
            </span>
            <Link 
              href={`/txs?page=${mockTransactions.currentPage + 1}${address ? `&a=${address}` : ''}`}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              ›
            </Link>
            <Link 
              href={`/txs?page=${Math.ceil(mockTransactions.total / mockTransactions.perPage)}${address ? `&a=${address}` : ''}`}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              Last
            </Link>
          </div>
        </div>

        {/* Info Text */}
        <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
          <span className="mr-1">ℹ️</span>
          A transaction is a cryptographically signed instruction that changes the blockchain state. Block explorers track the details of all transactions in the network.{' '}
          <Link href="/knowledge-base" className="text-blue-500 hover:text-blue-600">
            Learn more about transactions in our Knowledge Base
          </Link>
          .
        </div>
      </div>
    </div>
  )
} 