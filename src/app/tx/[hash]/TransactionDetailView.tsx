"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Transaction } from "@/src/types";
import { formatTimeAgo } from "@/src/lib/utils";
import {
  ButtonGroup,
  SponsorTitle,
} from "../../address/[address]/AddressContent";
import { ArrowRightLeft, Copy } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

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
);

type ViewProps = {
  transaction: Transaction;
};

export default function TransactionDetailView({ transaction }: ViewProps) {
  const handleCopy = async (tx: string) => {
    try {
      await navigator.clipboard.writeText(tx);
      toast.success("Copied!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl">Transaction Details</h1>
        <ButtonGroup />
      </div>

      <SponsorTitle />

      <div className="bg-white rounded-lg shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] border border-gray-200 text-sm font-light">
        <div className="p-6">
          <div className="space-y-4">
            {/* Transaction Hash */}
            <div className="flex">
              <InfoLabel
                label="Transaction Hash:"
                tooltip="A TxHash or transaction hash is a uniquie 66-character identifer that is generated whenever a transaction is executed."
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-900">
                  {transaction.transactionHash}
                </span>
                <Copy
                  className="w-4 h-4 cursor-pointer text-gray-400"
                  onClick={() => handleCopy(transaction.transactionHash)}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex">
              <InfoLabel
                label="Status:"
                tooltip="The status of the transaction"
              />
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 text-[#00a186] bg-[#00a18610] border border-[#00a18630] px-2 py-1 rounded-md text-xs">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className="font-medium">Success</span>
                </span>
              </div>
            </div>

            {/* Block */}
            <div className="flex">
              <InfoLabel
                label="Block:"
                tooltip="Number of the block in which the transaction is recorded."
              />
              <div className="flex-1 text-[#0784c3]">
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

            {/* Transaction Action */}
            <div className="flex pb-3 border-b border-gray-100">
              <div className="w-80 text-gray-600 font-light flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#0784c3]" />
                <span>Transaction Action:</span>
              </div>
              <div className="flex-1 flex gap-2 text-gray-600">
                <span className="">Transfer</span>
                <span className="text-gray-900 font-normal">{`${transaction.amount} ${transaction.token.symbol}`}</span>
                <span>To</span>
                <span className="text-[#0784c3]">{transaction.toAddress}</span>
              </div>
            </div>

            {/* Sporsored */}
            <div className="flex items-start pb-3 border-b border-gray-100">
              <InfoLabel
                label="Sponsored:"
                tooltip="Sponsored banner advertisement"
              />
              <div className="flex-1 flex gap-2 text-gray-600">
                <Image
                  src="/images/ads.png"
                  alt="sponsor"
                  width={200}
                  height={90}
                  className="rounded-md h-[90px] w-auto"
                />
              </div>
            </div>

            {/* From */}
            <div className="flex">
              <InfoLabel
                label="From:"
                tooltip="The sending party of the transaction"
              />
              <div className="flex-1">
                <Link
                  href={`/address/${transaction.fromAddress}`}
                  className="text-[#0784c3] hover:text-blue-600"
                >
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
                <Link
                  href={`/address/${transaction.toAddress}`}
                  className="text-[#0784c3] hover:text-blue-600"
                >
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
              <div className="flex-1">{transaction.method || "Transfer"}</div>
            </div>

            {/* Value */}
            <div className="flex py-3 border-b border-gray-200">
              <InfoLabel
                label="Value:"
                tooltip="The value being transacted in DFS and fiat value."
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {transaction.amount}{" "}
                  {transaction.method === "Token Created"
                    ? "DFS"
                    : transaction.token.symbol}
                </div>
              </div>
            </div>

            {/* Transaction Fee */}
            <div className="flex py-3">
              <InfoLabel
                label="Transaction Fee:"
                tooltip="Amount paid for processing the transaction."
              />
              <div className="flex-1">{transaction.gasFee} DFS</div>
            </div>

            {/* {transaction.message && (
              <div className="flex py-3">
                <InfoLabel
                  label="Message:"
                  tooltip="Optional message included with the transaction"
                />
                <div className="flex-1">{transaction.message}</div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
