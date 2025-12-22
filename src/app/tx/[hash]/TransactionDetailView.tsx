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
import { formatNumber, formatTimeAgo, shortenAddress } from "@/src/lib/utils";
import {
  ButtonGroup,
  SponsorTitle,
} from "../../address/[address]/AddressContent";
import { ArrowRightLeft, Copy, PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const InfoLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="w-full md:w-80 md:text-gray-600 text-gray-900 flex items-center gap-2 md:font-thin font-normal">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FontAwesomeIcon
            icon={faQuestionCircle}
            className="md:text-gray-600 text-gray-900 hover:text-gray-700 text-sm"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
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

  const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center md:justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl">Transaction Details</h1>
        <div className="flex-1 flex items-center justify-end">
          <ButtonGroup />
        </div>
      </div>

      <SponsorTitle />

      <div className="bg-white rounded-lg shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] border border-gray-200 text-sm font-light">
        <div className="p-6">
          <div className="space-y-4">
            {/* Transaction Hash */}
            <div className="flex md:flex-row flex-col">
              <InfoLabel
                label="Transaction Hash:"
                tooltip="A TxHash or transaction hash is a uniquie 66-character identifer that is generated whenever a transaction is executed."
              />
              <div className="flex-1 flex items-center gap-2 break-all">
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
            <div className="flex md:flex-row flex-col">
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
            <div className="flex md:flex-row flex-col">
              <InfoLabel
                label="Block:"
                tooltip="Number of the block in which the transaction is recorded."
              />
              <div className="flex-1 text-[#0784c3]">
                {transaction.blockNumber}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex md:flex-row flex-col pb-3 border-b border-gray-100">
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
            <div className="flex md:flex-row flex-col pb-3 border-b border-gray-100">
              <div className="w-full md:w-80 md:text-gray-600 text-gray-900 flex items-center gap-2 md:font-thin font-normal">
                <ArrowRightLeft className="w-4 h-4 text-[#0784c3]" />
                <span className="">Transaction Action:</span>
              </div>
              <div className="flex-1 flex gap-2 text-gray-600">
                  <span className="break-all">
                  Transfer{" "}
                  <span className="text-gray-900 font-normal whitespace-nowrap">{`${
                    transaction.amount
                  } ${
                    transaction.method === "Token Created"
                      ? "DFS"
                      : transaction.token?.symbol || "DFS"
                  }`}</span>{" "}
                  To{" "}
                  <span className="text-[#0784c3]">
                    {transaction.method === "Token Created"
                      ? transaction.fromAddress
                      : transaction.toAddress}
                  </span>
                </span>
              </div>
            </div>

            {/* Transaction Details */}
            {transaction?.allTransfers &&
              transaction?.allTransfers?.length > 0 && (
                <div className="flex md:flex-row flex-col pb-3 border-b border-gray-100 items-start">
                  <InfoLabel
                    label="DRC-20 Tokens Transferred:"
                    tooltip="List of DRC-20 tokens transferred in the transaction."
                  />
                  <div className="transaction-details space-y-1">
                    {transaction?.allTransfers?.map((tokenTransfer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-gray-900 font-semibold whitespace-nowrap">
                          From
                        </span>
                        <span className="text-[#0784c3] cursor-pointer">
                          {shortenAddress(tokenTransfer.fromAddress)}
                        </span>
                        <span className="text-gray-900 font-semibold whitespace-nowrap">
                          To
                        </span>
                        <span className="text-[#0784c3] cursor-pointer">
                          {shortenAddress(tokenTransfer.toAddress)}
                        </span>
                        <span className="text-gray-900 font-semibold whitespace-nowrap">
                          For
                        </span>
                        <span className="text-gray-900 font-normal whitespace-nowrap">
                          {formatNumber(tokenTransfer.amount, 6)}
                        </span>
                        <div
                          className="flex items-center gap-1 cursor-pointer border border-dashed border-white hover:border-[#ffda6a] rounded-md p-[2px] hover:bg-[#ffda6a30]"
                          onClick={() => {
                            if (tokenTransfer.token.address === "drc20_dfs")
                              return;
                            window.open(
                              `https://dfsscan.com/address/${tokenTransfer.token.address}`,
                              "_blank"
                            );
                          }}
                        >
                          {tokenTransfer.token.logoUrl ? (
                            <Image
                              src={tokenTransfer.token.logoUrl}
                              alt={tokenTransfer.token.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-900 font-normal whitespace-nowrap">
                                {tokenTransfer.token.symbol.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-gray-900 font-normal whitespace-nowrap">
                            {tokenTransfer.token.name}
                          </span>
                          <span className="text-gray-900 font-normal whitespace-nowrap">
                            ({tokenTransfer.token.symbol})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Sporsored */}
            <div className="flex items-start md:flex-row flex-col pb-3 border-b border-gray-100">
              <InfoLabel
                label="Sponsored:"
                tooltip="Sponsored banner advertisement"
              />
              <div className="flex-1 flex gap-2 text-gray-600">
                <Image
                  src="/images/ads-long.png"
                  alt="sponsor"
                  width={500}
                  height={120}
                  className="rounded-md md:h-[120px] h-[70px] w-auto"
                />
              </div>
            </div>

            {/* From */}
            <div className="flex md:flex-row flex-col">
              <InfoLabel
                label="From:"
                tooltip="The sending party of the transaction"
              />
              <div className="flex-1">
                <Link
                  href={`/address/${
                    transaction.method === "Token Created"
                      ? ZERO_ADDRESS
                      : transaction.fromAddress
                  }`}
                  className="text-[#0784c3] hover:text-blue-600 break-all"
                >
                  {transaction.method === "Token Created"
                    ? ZERO_ADDRESS
                    : transaction.fromAddress}
                </Link>
              </div>
            </div>

            {/* To */}
            <div className="flex md:flex-row flex-col pb-3 border-b border-gray-200">
              <InfoLabel
                label="To:"
                tooltip="The receiving party of the transaction (could be a contract address)"
              />
              <div className="flex-1">
                <Link
                  href={`/address/${
                    transaction.method === "Token Created"
                      ? transaction.fromAddress
                      : transaction.toAddress
                  }`}
                  className="text-[#0784c3] hover:text-blue-600 break-all"
                >
                  {transaction.method === "Token Created"
                    ? transaction.fromAddress
                    : transaction.toAddress}
                </Link>
              </div>
            </div>

            {/* Method */}
            <div className="flex md:flex-row flex-col pb-3 border-b border-gray-200">
              <InfoLabel
                label="Method:"
                tooltip="The type of transaction that was executed"
              />
              <div className="flex-1">{transaction.method || "Transfer"}</div>
            </div>

            {/* Value */}
            <div className="flex md:flex-row flex-col py-3 border-b border-gray-200">
              <InfoLabel
                label="Value:"
                tooltip="The value being transacted in DFS and fiat value."
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {formatNumber(Number(transaction.amount), 6)}{" "}
                  {transaction.method === "Token Created"
                    ? "DFS"
                    : transaction.token?.symbol || "DFS"}
                </div>
              </div>
            </div>

            {/* Transaction Fee */}
            <div className="flex md:flex-row flex-col py-3">
              <InfoLabel
                label="Transaction Fee:"
                tooltip="Amount paid for processing the transaction."
              />
              <div className="flex-1">
                {formatNumber(Number(transaction.gasFee), 6)} DFS
              </div>
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

      <div className="bg-white rounded-lg shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] border border-gray-200 text-sm font-light">
        <div className="p-6 flex md:flex-row flex-col items-center justify-between">
          <h2 className="w-full md:w-80 md:text-gray-600 text-gray-900 flex items-center gap-2 md:font-thin font-normal">
            More Details:
          </h2>
          <div className="flex-1 flex items-center gap-1 cursor-pointer">
            <PlusIcon className="w-4 h-4 text-[#0784c3]" />
            <span className="text-[#0784c3]">Click to show more</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] border border-gray-200 text-sm font-light">
        <div className="p-6 flex md:flex-row flex-col items-center justify-between">
          <InfoLabel
            label="Private Note:"
            tooltip="Private note to keep track of the transaction. Only viewable to DFSScan's user who assign them."
          />
          <div className="flex-1 flex items-center gap-1">
            <span className="break-all">
              To access the <span className="font-normal">Private Note</span>{" "}
              feature, you must be{" "}
              <span className="text-[#0784c3]">Logged In</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
