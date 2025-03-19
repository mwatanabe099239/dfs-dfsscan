'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCheckCircle, 
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"

const mockTransaction = {
  hash: '0x36baeb08a338e1fd2bb1eecf70092719fc325b33ed489b9d61c567ceb7f617a6',
  status: 'Success',
  block: 47605447,
  blockConfirmations: 796,
  timestamp: '2025-03-19 03:26:56 PM UTC',
  action: {
    type: 'Transfer',
    amount: '0.016150746603099538',
    amountUSD: '$9.85',
    burn: {
      amount: '0.025841194564959261',
      amountUSD: '$15.75'
    }
  },
  from: {
    address: '0x7b501c7944185130DD4aD732293e8Aa84eFfDcee7',
    label: 'Validator : MathWallet'
  },
  to: {
    address: '0x0000000000000000000000000000000000001000',
    label: 'BSC: Validator Set'
  },
  value: {
    amount: '0.25841194564959261',
    amountUSD: '$157.54'
  },
  txFee: {
    amount: '0',
    amountUSD: '$0.00'
  },
  gasPrice: '0 BNB (0 BNB)'
}

const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="w-48 text-gray-500 flex items-center gap-2">
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
  hash: string
}

export default function TransactionDetailView({ hash }: ViewProps) {
  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center">
        <h1 className="text-xl">Transaction Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-6">
            {/* Transaction Hash */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Transaction Hash:"
                tooltip="A TxHash or transaction hash is a uniquie 66-character identifer that is generated whenever a transaction is executed."
              />
              <div className="flex-1 font-medium flex items-center gap-2">
                {hash}
                <button className="text-gray-400 hover:text-gray-600">
                  <i className="far fa-copy" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex py-3 border-b border-gray-200">
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
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Block:"
                tooltip="Number of the block in which the transaction is recorded. Block confirmations indicate how many blocks have been added since the transaction was produced."
              />
              <div className="flex-1">
                <Link href={`/block/${mockTransaction.block}`} className="text-blue-500 hover:text-blue-600">
                  {mockTransaction.block}
                </Link>
                <span className="text-gray-500 ml-2">
                  {mockTransaction.blockConfirmations} Block Confirmations
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Timestamp:"
                tooltip="The date and time at which a transaction is validated."
              />
              <div className="flex-1">
                <span className="text-gray-600">
                  39 mins ago ({mockTransaction.timestamp})
                </span>
              </div>
            </div>

            {/* Transaction Action */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Transaction Action:"
                tooltip="Highlighted events of the transaction"
              />
              <div className="flex-1 space-y-2">
                <div>
                  Transfer {mockTransaction.action.amount} BNB ({mockTransaction.action.amountUSD}) to{' '}
                  <Link href="#" className="text-blue-500">BSC: System Reward</Link>
                </div>
                <div>
                  Burn {mockTransaction.action.burn.amount} BNB ({mockTransaction.action.burn.amountUSD})
                </div>
              </div>
            </div>

            {/* From */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="From:"
                tooltip="The sending party of the transaction"
              />
              <div className="flex-1">
                <Link href={`/address/${mockTransaction.from.address}`} className="text-blue-500 hover:text-blue-600">
                  {mockTransaction.from.address}
                </Link>
                <span className="text-gray-500 ml-2">({mockTransaction.from.label})</span>
              </div>
            </div>

            {/* To */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="To:"
                tooltip="The receiving party of the transaction (could be a contract address)"
              />
              <div className="flex-1">
                <Link href={`/address/${mockTransaction.to.address}`} className="text-blue-500 hover:text-blue-600">
                  {mockTransaction.to.address}
                </Link>
                <span className="text-gray-500 ml-2">({mockTransaction.to.label})</span>
              </div>
            </div>

            {/* Value */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Value:"
                tooltip="The value being transacted in BNB and fiat value. Note: You can click the fiat value(if available) to see historical value at the time of transaction"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <i className="fab fa-bitcoin text-yellow-500" />
                  {mockTransaction.value.amount} BNB
                  <span className="text-gray-500">({mockTransaction.value.amountUSD})</span>
                </div>
              </div>
            </div>

            {/* Transaction Fee */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Transaction Fee:"
                tooltip="Amount paid tothe validator for processing the translation."
              />
              <div className="flex-1">
                {mockTransaction.txFee.amount} BNB ({mockTransaction.txFee.amountUSD})
              </div>
            </div>

            {/* Gas Price */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel 
                label="Gas Price:"
                tooltip="Cost per unit of gas specified for the transaction, in BNB and Gwei. The higher the gas price the higher the chance of getting included in a block"
              />
              <div className="flex-1">
                {mockTransaction.gasPrice}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 