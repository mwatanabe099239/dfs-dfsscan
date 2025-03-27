'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"
import { Transaction } from '../../types'
import { formatTimeAgo } from '../../lib/utils'

const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="w-80 text-gray-600 font-light flex items-center gap-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FontAwesomeIcon 
            icon={faQuestionCircle} 
            className="text-gray-400 hover:text-gray-600 text-sm"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    {label}
  </div>
)

type ViewProps = {
  transaction: Transaction
}

export default function TransactionDetailView({ transaction }: ViewProps) {
  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center">
        <h1 className="text-xl">Transaction Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] border border-gray-200 text-sm font-light">
        <div className="p-6">
          <div className="space-y-4">
            {/* Transaction Hash */}
            <div className="flex">
              <InfoLabel 
                label="Transaction Hash:"
                tooltip="A TxHash or transaction hash is a uniquie 66-character identifer that is generated whenever a transaction is executed."
              />
              <div className="flex-1 font-medium flex items-center gap-2">
                {transaction.transactionHash}
                <button className="text-gray-400 hover:text-gray-600">
                  <i className="far fa-copy" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex">
              <InfoLabel 
                label="Status:"
                tooltip="The status of the transaction"
              />
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Success</span>
                </span>
              </div>
            </div>

            {/* Block */}
            <div className="flex">
              <InfoLabel 
                label="Block:"
                tooltip="Number of the block in which the transaction is recorded."
              />
              <div className="flex-1 text-black">
                {transaction.blockNumber}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex pb-3 border-b border-gray-100">
              <InfoLabel 
                label="Timestamp:"
                tooltip="The date and time at which a transaction is validated."
              />
              <div className="flex-1">
                <span className="text-gray-600">
                  {formatTimeAgo(transaction.createdAt.getTime() / 1000)}
                </span>
              </div>
            </div>

            {/* From */}
            <div className="flex">
              <InfoLabel 
                label="From:"
                tooltip="The sending party of the transaction"
              />
              <div className="flex-1">
                <Link href={`/address/${transaction.fromAddress}`} className="text-blue-500 hover:text-blue-600">
                  {transaction.fromAddress}
                </Link>
              </div>
            </div>

            {/* To */}
            <div className="flex pb-3 border-b border-gray-200">
              <InfoLabel 
                label="To:"
                tooltip="The receiving party of the transaction (could be a contract address)"
              />
              <div className="flex-1">
                <Link href={`/address/${transaction.toAddress}`} className="text-blue-500 hover:text-blue-600">
                  {transaction.toAddress}
                </Link>
              </div>
            </div>

            {/* Method */}
            <div className="flex pb-3 border-b border-gray-200">
              <InfoLabel 
                label="Method:"
                tooltip="The type of transaction that was executed"
              />
              <div className="flex-1">
                {transaction.method || 'Transfer'}
              </div>
            </div>

            {/* Value */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Value:"
                tooltip="The value being transacted in DFS and fiat value."
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {transaction.amount} {transaction.method === 'Token Created' ? 'DFS' : transaction.token.symbol}
                </div>
              </div>
            </div>

            {/* Transaction Fee */}
            <div className={`flex py-3 ${!transaction.message && 'border-none'} ${transaction.message && 'border-b border-gray-200'}`}>
              <InfoLabel 
                label="Transaction Fee:"
                tooltip="Amount paid for processing the transaction."
              />
              <div className="flex-1">
                {transaction.gasFee} DFS
              </div>
            </div>

            {/* Message (if exists) */}
            {transaction.message && (
              <div className="flex py-3">
                <InfoLabel 
                  label="Message:"
                  tooltip="Optional message included with the transaction"
                />
                <div className="flex-1">
                  {transaction.message}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 