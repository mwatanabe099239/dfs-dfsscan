'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faQuestionCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { minidenticon } from 'minidenticons'
import { useMemo, use, useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

// Updated mock data with token holdings
const mockData = {
  address: '0x1cFDBd2dFf70C6e2e30df5012725F387731F38164',
  isValidator: true,
  validatorName: 'Validator : Tranchess',
  balance: {
    amount: '0.438521343922152951',
    value: '$269.62 (@ $614.83/BNB)'
  },
  tokenHoldings: {
    value: '104.61',
    count: '85 Tokens',
    tokens: [
      {
        name: 'GALABET CASINO',
        symbol: 'GALABET',
        amount: '2,040',
        value: '$104.54',
        rate: '@0.0444'
      },
      {
        name: 'Chumbi Valley',
        symbol: 'CHMB',
        amount: '3,000',
        value: '$0.04',
        rate: '@0.00'
      },
      {
        name: 'Black Agnus (FTW)',
        symbol: 'FTW',
        amount: '55,555',
        value: '$0.03',
        rate: '@0.00'
      },
      {
        name: 'Binance-Peg... (BSC-US...)',
        symbol: 'BSC-USD',
        amount: '0.00501',
        value: '$0.01',
        rate: '@1.00'
      }
    ]
  },
  transactions: {
    latest: '20 secs ago',
    first: '333 days ago',
    fundedBy: {
      address: '0xD80B43e4...E2368d741',
      txn: '0x29c53f04b53...'
    }
  }
}

// Updated mock transaction data with 25 entries
const mockTransactions = {
  total: 403074,
  latest: 25,
  transactions: [
    {
      hash: '0x110a7b6fc87...',
      method: 'Deposit',
      block: '47611463',
      age: '20 secs ago',
      from: {
        name: 'Validator : Tranchess',
        isOut: true
      },
      to: {
        name: 'BSC: Validator Set',
        isContract: true
      },
      amount: '0.01184781 BNB',
      fee: '0'
    },
    // ... add 23 more similar transactions with different values
    {
      hash: '0xe8d154b1c5...',
      method: 'Deposit',
      block: '47611032',
      age: '21 mins ago',
      from: {
        name: 'Validator : Tranchess',
        isOut: true
      },
      to: {
        name: 'BSC: Validator Set',
        isContract: true
      },
      amount: '0.02269443 BNB',
      fee: '0'
    }
  ]
}

export default function AddressDetail({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)
  const [showTokens, setShowTokens] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTokens(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const identicon = useMemo(() => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      minidenticon(address)
    )}`
  }, [address])

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(mockData.address)
      toast.success('Address Copied')
    } catch (err) {
      toast.error('Failed to copy address')
    }
  }

  // Format number with consistent formatting
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div className="space-y-4">
      {/* Header with address */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <img 
            src={identicon} 
            alt="" 
            className="w-6 h-6 rounded-full bg-gray-100"
          />
          <h1 className="text-lg">Address</h1>
          <span className="text-gray-600">{mockData.address}</span>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600"
          onClick={handleCopyClick}
        >
          <FontAwesomeIcon icon={faCopy} />
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <i className="fas fa-qrcode"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h2 className="text-lg mb-4">Overview</h2>
            
            {/* BNB Balance */}
            <div className="mb-4">
              <div className="text-gray-600 text-sm mb-1">BNB BALANCE</div>
              <div className="font-medium">{mockData.balance.amount} BNB</div>
            </div>

            {/* BNB Value */}
            <div className="mb-4">
              <div className="text-gray-600 text-sm mb-1">BNB VALUE</div>
              <div className="font-medium">{mockData.balance.value}</div>
            </div>

            {/* Token Holdings with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="text-gray-600 text-sm mb-1">TOKEN HOLDINGS</div>
              <button 
                onClick={() => setShowTokens(!showTokens)}
                className="w-full"
              >
                <div className="flex items-center justify-between border border-gray-200 rounded p-2 hover:border-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-medium">${mockData.tokenHoldings.value}</span>
                    <span className="text-gray-500">({mockData.tokenHoldings.count})</span>
                  </div>
                  <FontAwesomeIcon 
                    icon={showTokens ? faChevronUp : faChevronDown}
                    className="text-gray-400 text-xs"
                  />
                </div>
              </button>

              {/* Token Holdings Dropdown */}
              {showTokens && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg z-10 ">
                  {/* Search Box */}
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search for Token Name"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* BEP-20 Tokens Header */}
                  <div className="flex items-center px-3 py-1.5 bg-gray-50  border-b border-gray-200">
                    <span className="text-sm text-gray-600">BEP-20 Tokens</span>
                    <span className="text-xs text-gray-500 ml-1">({mockData.tokenHoldings.tokens.length})</span>
                  </div>

                  {/* Token List */}
                  <div className="max-h-[280px] overflow-y-auto">
                    {mockData.tokenHoldings.tokens.map((token, index) => (
                      <div key={index} className="px-3 py-2 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-sm">{token.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {token.amount} {token.symbol}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{token.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{token.rate}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Holdings Button */}
                  <div className="p-2 text-center border-t border-gray-200 bg-gray-50">
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                      VIEW ALL HOLDINGS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle column - More Info */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h2 className="text-lg mb-4">More Info</h2>
            
            {/* Private Name Tags */}
            <div className="mb-4">
              <div className="text-gray-600 text-sm mb-1">PRIVATE NAME TAGS</div>
              <button className="text-blue-500 hover:text-blue-600 text-sm">+ Add</button>
            </div>

            {/* Transactions */}
            <div className="mb-4">
              <div className="text-gray-600 text-sm mb-1">TRANSACTIONS SENT</div>
              <div>
                Latest: {mockData.transactions.latest} ↗
                <br />
                First: {mockData.transactions.first} ↗
              </div>
            </div>

            {/* Funded By */}
            <div>
              <div className="text-gray-600 text-sm mb-1">FUNDED BY</div>
              <div className="text-sm">
                <Link href="#" className="text-blue-500 hover:text-blue-600">
                  {mockData.transactions.fundedBy.address}
                </Link>
                {' '}at txn{' '}
                <Link href="#" className="text-blue-500 hover:text-blue-600">
                  {mockData.transactions.fundedBy.txn}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Multichain Info */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h2 className="text-lg mb-4">Multichain Info</h2>
            <div className="text-gray-600">No addresses found</div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button className="px-4 py-2 text-blue-500 border-b-2 border-blue-500">Transactions</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Internal Transactions</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Token Transfers (BEP-20)</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">NFT Transfers</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Analytics</button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Assets</button>
          </div>
        </div>

        {/* Transaction List */}
        <div>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span>Latest {mockTransactions.latest} from a total of </span>
              <span className="text-blue-500">{formatNumber(mockTransactions.total)}</span>
              <span>transactions</span>
            </div>
          </div>

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
                      <div className="flex items-center gap-1">
                        <Link href="#" className="text-blue-500 hover:text-blue-600">
                          {tx.from.name}
                        </Link>
                        {tx.from.isOut && (
                          <span className="bg-orange-100 text-orange-600 text-xs px-1.5 rounded">
                            OUT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Link href="#" className="text-blue-500 hover:text-blue-600">
                          {tx.to.name}
                        </Link>
                        {tx.to.isContract && (
                          <i className="fas fa-file-contract text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">{tx.amount}</td>
                    <td className="p-3 text-right">{tx.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View All Transactions Link */}
        <div className="p-4 text-center border-t border-gray-200">
          <Link 
            href={`/txs?a=${address}`}
            className="text-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
          >
            VIEW ALL TRANSACTIONS
            <span className="text-xs">→</span>
          </Link>
        </div>

        {/* Info Text */}
        <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
          <span className="mr-1">ℹ️</span>
          A wallet address is a publicly available address that allows its owner to receive funds from another party. To access the funds in an address, you must have its private key.{' '}
          <Link href="/knowledge-base" className="text-blue-500 hover:text-blue-600">
            Learn more about addresses in our Knowledge Base
          </Link>
          .
        </div>

        {/* Download CSV */}
        <div className="p-4 text-right border-t border-gray-200">
          <button className="text-blue-500 hover:text-blue-600 text-sm">
            [ Download CSV Export ]
          </button>
        </div>
      </div>
    </div>
  )
} 