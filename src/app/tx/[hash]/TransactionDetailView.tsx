"use client";

import { useState } from "react";
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
import { formatNumber, formatTimeAgo, shortenAddress, shortenHash } from "@/src/lib/utils";
import {
  ButtonGroup,
  SponsorTitle,
} from "../../address/[address]/AddressContent";
import { ArrowRightLeft, Copy, PlusIcon, Eye, ChevronDown, Code, List, Zap, GitCompareArrows } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import SearchBar from "@/src/components/SearchBar";
import { useViewMode } from "@/src/contexts/ViewModeContext";

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

// BSCScan View Component
function BSCScanView({ transaction }: ViewProps) {
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

// SolanaScan View Component
function SolanaScanView({ transaction }: ViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "balance_change" | "raw">("overview");
  // Disabled tabs: balance_change and raw

  const handleCopy = async (tx: string) => {
    try {
      await navigator.clipboard.writeText(tx);
      toast.success("Copied!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";
  
  const formatFullTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
      timeZoneName: "short",
    });
  };

  const timestamp = transaction.createdAt.getTime() / 1000;

  return (
    <div className="my-8 mx-auto max-w-full px-4 md:px-6 2xl:px-0 2xl:max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-start mb-4 gap-2 sm:gap-4">
        <div className="flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-0 w-full gap-y-2 sm:gap-y-4 flex flex-col-reverse sm:flex-row sm:items-center">
          <div className="max-w-24/24 md:max-w-12/24 flex-24/24 md:flex-12/24 block relative box-border my-0 px-0">
            <div className="flex gap-1 flex-col items-start justify-start flex-wrap">
              <h4 className="not-italic text-gray-900 text-[22px] leading-[28px] font-medium">Transaction Details</h4>
            </div>
          </div>
          <div className="md:max-w-12/24 max-w-24/24 md:flex-12/24 flex-24/24 block relative box-border my-0 px-0 lg:flex lg:justify-end">
            <SearchBar />
          </div>
        </div>
        
        {/* Sponsored Section */}
        <div className="w-full">
          <div className="flex gap-3 justify-between flex-wrap flex-col lg:flex-row items-start lg:items-center min-h-[36px]">
            <div className="w-full lg:w-[calc(100%-480px)]">
              <div className="flex flex-row items-stretch justify-start flex-wrap gap-0 adsHeaderTextWrapper">
                <div className="flex gap-0 flex-row items-center justify-start flex-wrap pt-3">
                  <div className="text-gray-700 text-[15px] leading-[24px] font-normal">
                    <div>
                      <span className="font-semibold">Sponsored: </span>
                      Advertise across our explorers and boost your visibility.{" "}
                      <span className="text-[#14F195] cursor-pointer hover:underline">
                        Book your slot here!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[458px]">
              <div className="flex flex-row items-center justify-start flex-wrap gap-1 sm:gap-3 w-full sm:w-auto">
                <button type="button" className="flex-1">
                  <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#009978] text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="text-inherit hidden sm:block">
                      <path d="M14.6667 14.1665C14.6667 14.4398 14.44 14.6665 14.1667 14.6665H1.83333C1.55999 14.6665 1.33333 14.4398 1.33333 14.1665C1.33333 13.8932 1.55999 13.6665 1.83333 13.6665H14.1667C14.44 13.6665 14.6667 13.8932 14.6667 14.1665Z" fill="currentColor"></path>
                      <path d="M10.26 3.01353L3.10001 10.1735C2.82668 10.4469 2.61331 10.6668 2.12001 10.1735H2.11335C1.18668 9.2402 0.333331 8.58686 2.11335 6.80687L6.88001 2.0402C8.58669 0.333508 9.32001 1.10687 10.2533 2.0402C10.6667 2.45352 10.5267 2.74687 10.26 3.01353Z" fill="currentColor"></path>
                      <path d="M13.88 5.66021L11.8467 3.62687C11.5733 3.35354 11.1333 3.35354 10.8667 3.62687L3.70666 10.7869C3.43333 11.0535 3.43333 11.4935 3.70666 11.7669L5.74 13.8069C6.67333 14.7335 8.18 14.7335 9.11333 13.8069L13.8733 9.04021C15 7.91354 15.3333 7.11354 13.88 5.66021ZM8.50666 11.6802L7.7 12.4935C7.53333 12.6602 7.26 12.6602 7.08666 12.4935C6.92 12.3269 6.92 12.0535 7.08666 11.8802L7.9 11.0669C8.06 10.9069 8.34 10.9069 8.50666 11.0669C8.67333 11.2335 8.67333 11.5202 8.50666 11.6802ZM11.1533 9.03354L9.52666 10.6669C9.36 10.8269 9.08666 10.8269 8.91333 10.6669C8.74666 10.5002 8.74666 10.2269 8.91333 10.0535L10.5467 8.42021C10.7067 8.26021 10.9867 8.26021 11.1533 8.42021C11.32 8.59354 11.32 8.86688 11.1533 9.03354Z" fill="currentColor"></path>
                    </svg>
                    <div className="text-[14px] leading-[20px] font-medium text-inherit">Buy</div>
                    <ChevronDown className="w-4 h-4 text-inherit" />
                  </div>
                </button>
                <button type="button" className="flex-1">
                  <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#009978] text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" className="text-inherit hidden sm:block">
                      <path d="M6.33334 9.76699V11.567C6.33334 13.067 5.73334 13.667 4.23334 13.667H2.43334C0.933336 13.667 0.333336 13.067 0.333336 11.567V9.76699C0.333336 8.26699 0.933336 7.66699 2.43334 7.66699H4.23334C5.73334 7.66699 6.33334 8.26699 6.33334 9.76699Z" fill="currentColor"></path>
                      <path d="M10.6667 6.3335C12.3235 6.3335 13.6667 4.99035 13.6667 3.3335C13.6667 1.67664 12.3235 0.333496 10.6667 0.333496C9.00982 0.333496 7.66667 1.67664 7.66667 3.3335C7.66667 4.99035 9.00982 6.3335 10.6667 6.3335Z" fill="currentColor"></path>
                      <path d="M8.85332 13.6667C8.67332 13.6667 8.50665 13.5667 8.41999 13.4133C8.33332 13.2533 8.33332 13.0667 8.42665 12.9067L9.07332 11.8267C9.21332 11.5867 9.51999 11.5133 9.75999 11.6533C9.99999 11.7933 10.0733 12.1 9.93332 12.34L9.81332 12.54C11.46 12.1133 12.6733 10.62 12.6733 8.84668C12.6733 8.57335 12.9 8.34668 13.1733 8.34668C13.4467 8.34668 13.6667 8.57335 13.6667 8.85335C13.6667 11.5067 11.5067 13.6667 8.85332 13.6667Z" fill="currentColor"></path>
                      <path d="M0.833336 5.64683C0.560003 5.64683 0.333336 5.42683 0.333336 5.14683C0.333336 2.4935 2.49334 0.333496 5.14667 0.333496C5.33334 0.333496 5.49334 0.433496 5.58667 0.58683C5.67334 0.74683 5.67334 0.933496 5.58 1.0935L4.93334 2.16683C4.78667 2.40683 4.48 2.48683 4.24667 2.34016C4.00667 2.20016 3.93334 1.8935 4.07334 1.6535L4.19334 1.4535C2.55334 1.88016 1.33334 3.3735 1.33334 5.14683C1.33334 5.42683 1.10667 5.64683 0.833336 5.64683Z" fill="currentColor"></path>
                    </svg>
                    <div className="text-[14px] leading-[20px] font-medium text-inherit">Presale</div>
                    <ChevronDown className="w-4 h-4 text-inherit" />
                  </div>
                </button>
                <button type="button" className="flex-1">
                  <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#009978] text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit w-4 h-4 hidden sm:block">
                      <path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z"></path>
                      <path d="M12 17v4"></path>
                      <path d="M8 21h8"></path>
                      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                    </svg>
                    <div className="text-[14px] leading-[20px] font-medium text-inherit">Play</div>
                    <ChevronDown className="w-4 h-4 text-inherit" />
                  </div>
                </button>
                <button type="button" className="flex-1">
                  <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#009978] text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" className="text-inherit hidden sm:block">
                      <path d="M15.8333 10.4208C15.799 8.50726 15.5729 6.57224 15.2023 4.61916C14.9003 3.26221 13.8141 2.05364 12.0784 1.96513C10.7971 1.91242 10.5493 2.64231 9.09755 2.62828C8.69994 2.6257 8.30263 2.6257 7.90502 2.62828C6.45297 2.64231 6.20461 1.91242 4.92385 1.96513C3.18791 2.05364 2.06786 3.25906 1.79888 4.61916C1.42791 6.57224 1.2019 8.50697 1.16781 10.4205C1.1595 11.7528 2.47492 12.6391 3.34289 12.6999C5.01953 12.8265 6.35156 9.86994 7.36648 9.86966C8.12302 9.87395 8.87927 9.87424 9.6358 9.86966C10.651 9.86966 11.9819 12.8268 13.6597 12.7002C14.5274 12.6394 15.8769 11.7471 15.8336 10.4208H15.8333ZM6.6363 6.68711H5.85427V7.46914C5.85427 7.79914 5.58672 8.06669 5.25672 8.06669C4.92672 8.06669 4.65916 7.79914 4.65916 7.46914V6.68711H3.87713C3.54713 6.68711 3.27958 6.41955 3.27958 6.08955C3.27958 5.75955 3.54713 5.492 3.87713 5.492H4.65916V4.70997C4.65916 4.37997 4.92672 4.11242 5.25672 4.11242C5.58672 4.11242 5.85427 4.37997 5.85427 4.70997V5.492H6.6363C6.9663 5.492 7.23385 5.75955 7.23385 6.08955C7.23385 6.41955 6.9663 6.68711 6.6363 6.68711ZM11.4651 8.0664C10.9973 8.07901 10.6083 7.70948 10.5957 7.24197C10.5834 6.77276 10.9532 6.38317 11.4207 6.37114C11.8888 6.3594 12.2784 6.72864 12.2904 7.19671C12.3022 7.66479 11.9329 8.05437 11.4651 8.0664ZM12.8759 5.80768C12.4081 5.82086 12.0183 5.45104 12.0054 4.98325C11.9936 4.51461 12.3629 4.1256 12.831 4.1127C13.2996 4.10039 13.6886 4.4702 13.7012 4.93828C13.7135 5.40606 13.3434 5.79593 12.8759 5.80768Z" fill="currentColor"></path>
                    </svg>
                    <div className="text-[14px] leading-[20px] font-medium text-inherit">Gaming</div>
                    <ChevronDown className="w-4 h-4 text-inherit" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-col gap-6 items-stretch justify-start w-full">
        <div className="flex flex-col gap-4 items-stretch justify-start relative">
          <div className="w-full">
            <div className="tab-wrapper relative overflow-x-scroll no-scrollbar flex items-start sm:items-center sm:justify-between gap-2 sm:flex-row mb-3 w-full justify-between flex-row">
              <div dir="ltr" className="w-auto whitespace-nowrap" style={{ position: "relative", "--radix-scroll-area-corner-width": "0px", "--radix-scroll-area-corner-height": "0px" } as React.CSSProperties}>
                <div role="tablist" aria-orientation="horizontal" className="items-center justify-start rounded-md text-muted-foreground h-auto inline-flex bg-transparent p-0 w-full" tabIndex={0} data-orientation="horizontal" style={{ outline: "none" }}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "overview"}
                    aria-controls={`radix-:r5u:-content-overview`}
                    data-state={activeTab === "overview" ? "active" : "inactive"}
                    id={`radix-:r5u:-trigger-overview`}
                    onClick={() => setActiveTab("overview")}
                    className={`py-1.5 font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-300 border-0 rounded-lg text-xs text-gray-600 data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:!bg-[#009978] data-[state=active]:hover:!bg-[#008066] ml-2 first:ml-0 transition-colors duration-200 px-3 h-7 w-full`}
                    tabIndex={-1}
                    data-orientation="horizontal"
                    data-radix-collection-item=""
                  >
                    Overview
                  </button>
                  {/* Balance Changes tab - disabled */}
                  {/* <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "balance_change"}
                    aria-controls={`radix-:r5u:-content-balance_change`}
                    data-state={activeTab === "balance_change" ? "active" : "inactive"}
                    id={`radix-:r5u:-trigger-balance_change`}
                    onClick={() => setActiveTab("balance_change")}
                    className={`py-1.5 font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-300 border-0 rounded-lg text-xs text-gray-600 data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:!bg-[#009978] data-[state=active]:hover:!bg-[#008066] ml-2 first:ml-0 transition-colors duration-200 px-3 h-7 w-full`}
                    tabIndex={-1}
                    data-orientation="horizontal"
                    data-radix-collection-item=""
                  >
                    Balance Changes
                  </button> */}
                  {/* Raw tab - disabled */}
                  {/* <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "raw"}
                    aria-controls={`radix-:r5u:-content-raw`}
                    data-state={activeTab === "raw" ? "active" : "inactive"}
                    id={`radix-:r5u:-trigger-raw`}
                    onClick={() => setActiveTab("raw")}
                    className={`py-1.5 font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-300 border-0 rounded-lg text-xs text-gray-600 data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:!bg-[#009978] data-[state=active]:hover:!bg-[#008066] ml-2 first:ml-0 transition-colors duration-200 px-3 h-7 w-full`}
                    tabIndex={-1}
                    data-orientation="horizontal"
                    data-radix-collection-item=""
                  >
                    Raw
                  </button> */}
                </div>
              </div>
              <div className="flex gap-1 flex-row items-stretch justify-start flex-wrap">
                <button className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center h-auto transition-colors border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 disabled:bg-gray-100 text-gray-700 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-1.5 gap-0.5 px-2 text-[12px] leading-[14px] font-normal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-xml" aria-hidden="true">
                    <path d="m18 16 4-4-4-4"></path>
                    <path d="m6 8-4 4 4 4"></path>
                    <path d="m14.5 4-5 16"></path>
                  </svg>
                  API
                </button>
                <button className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold h-auto transition-colors border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 disabled:bg-gray-100 text-gray-700 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-1.5 text-[12px] leading-4.5 gap-0.5 px-2" type="button" id="radix-:r62:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list" aria-hidden="true">
                    <path d="M3 5h.01"></path>
                    <path d="M3 12h.01"></path>
                    <path d="M3 19h.01"></path>
                    <path d="M8 5h13"></path>
                    <path d="M8 12h13"></path>
                    <path d="M8 19h13"></path>
                  </svg>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="w-full">
            {activeTab === "overview" && (
              <div className="ring-offset-background focus-visible:outline-none w-full mt-0 bg-transparent p-0 border-none">
                <div className="flex flex-col gap-4 items-stretch justify-start">
                  {/* Summary Card */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden p-0">
                    <div className="flex flex-col gap-4 items-start justify-start">
                      <div className="flex gap-2 flex-row items-center justify-center flex-wrap p-4 bg-white rounded-2xl w-full">
                        <div className="w-full">
                          <div className="flex gap-2 flex-row items-center justify-between flex-nowrap w-full">
                            <div className="gap-1 flex-row items-center justify-center flex-wrap w-10 h-10 rounded-full border border-gray-200 bg-gray-50 hidden md:flex">
                              <div className="flex gap-1 flex-row items-center justify-center flex-wrap rounded-full w-[24px] h-[24px]">
                                <ArrowRightLeft className="w-full h-full text-gray-600" />
                              </div>
                            </div>
                            <div className="flex flex-col items-stretch justify-start w-full md:w-[calc(100%-50px)] gap-2 md:gap-0">
                              <div className="flex gap-1 flex-row items-center justify-between flex-wrap">
                                <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                                  <Zap className="w-3.5 h-3.5 block md:hidden text-gray-900 md:text-gray-500 font-medium md:font-normal" />
                                  <div className="text-[12px] leading-[16px] capitalize text-gray-900 md:text-gray-500 font-medium md:font-normal">summary</div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-row items-center justify-between flex-wrap my-0">
                                <div className="flex flex-row items-center justify-start flex-wrap gap-1 gap-y-[1px] w-full">
                                  <div className="font-normal text-gray-700 text-[14px] leading-[24px]">Transfer from</div>
                                  <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                    <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate max-w-[250px]">
                                      <div className="inline">
                                        <Link href={`/address/${
                                          transaction.method === "Token Created" ? ZERO_ADDRESS : transaction.fromAddress
                                        }`} className="text-current hover:underline">
                                          {shortenAddress(transaction.method === "Token Created" ? ZERO_ADDRESS : transaction.fromAddress)}
                                        </Link>
                                      </div>
                                    </span>
                                  </span>
                                  <div className="font-normal text-gray-700 text-[14px] leading-[24px]">to</div>
                                  <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                    <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate max-w-[250px]">
                                      <div className="inline">
                                        <Link href={`/address/${
                                          transaction.method === "Token Created" ? transaction.fromAddress : transaction.toAddress
                                        }`} className="text-current hover:underline">
                                          {shortenAddress(transaction.method === "Token Created" ? transaction.fromAddress : transaction.toAddress)}
                                        </Link>
                                      </div>
                                    </span>
                                  </span>
                                  <div className="font-normal text-gray-700 text-[14px] leading-[24px]">for</div>
                                  <div>
                                    <div className="text-gray-700 text-[14px] leading-[24px] font-bold">
                                      <div className="inline-flex">
                                        <span>{formatNumber(Number(transaction.amount), 6)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="whitespace-nowrap inline-flex items-center max-w-full min-w-0">
                                    <span className="inline-flex align-middle mr-1">
                                      <div className="inline-flex items-center">
                                        {transaction.token?.logoUrl ? (
                                          <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                            <Image
                                              src={transaction.token.logoUrl}
                                              alt={transaction.token.symbol}
                                              width={16}
                                              height={16}
                                              className="rounded-[5px] object-cover"
                                              style={{ position: "absolute", height: "100%", objectFit: "cover", left: 0 }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                            <div className="w-full h-full bg-gray-200 rounded-[5px]"></div>
                                          </div>
                                        )}
                                      </div>
                                    </span>
                                    <span className="align-middle font-normal text-gray-700 text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all truncate px-[3px] -mx-1 rounded-sm text-[#2563eb]">
                                      <div className="inline">
                                        <Link href={`/address/${transaction.token?.tokenAddress || "#"}`} className="text-current hover:underline">
                                          {transaction.method === "Token Created" ? "DFS" : transaction.token?.symbol || "DFS"}
                                        </Link>
                                      </div>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden p-0">
                    <div className="flex flex-col gap-4 items-start justify-start">
                      <div className="flex flex-col gap-4 items-stretch justify-start p-4 bg-white rounded-2xl w-full" id="top-tx-overview">
                        {/* Transaction Hash Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Transaction hash</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Transaction Hash</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-3 flex-row items-center justify-between flex-nowrap w-full">
                              <div className="flex gap-1 flex-row items-center justify-start flex-nowrap flex-1 min-w-0">
                                <span className="inline-block break-all text-[14px] border-none">{transaction.transactionHash}</span>
                                <div className="inline-flex align-middle">
                                  <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.transactionHash)} />
                                </div>
                              </div>
                              <button className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold transition-colors text-white bg-[#009978] hover:bg-[#008066] disabled:opacity-40 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-[6px] text-[12px] leading-2 gap-1 h-7 px-3">
                                <Eye className="w-3.5 h-3.5" />
                                Inspect Tx
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Transaction Hash */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 flex sm:hidden">
                          <div className="w-full flex-1 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex flex-col gap-1 items-stretch justify-start">
                              <div className="flex gap-2 flex-row items-center justify-between flex-nowrap w-full">
                                <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Transaction hash</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Transaction Hash</div>
                                </div>
                                <button className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold transition-colors text-white bg-[#009978] hover:bg-[#008066] disabled:opacity-40 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-[6px] text-[12px] leading-2 gap-1 h-7 px-3">
                                  <Eye className="w-3.5 h-3.5" />
                                  Inspect Tx
                                </button>
                              </div>
                              <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                                <div className="flex gap-1 flex-row items-center justify-start flex-nowrap flex-1 min-w-0">
                                  <span className="inline-block break-all text-[14px] border-none">{transaction.transactionHash}</span>
                                  <div className="inline-flex align-middle">
                                    <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#009978]" onClick={() => handleCopy(transaction.transactionHash)} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Block & Timestamp Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Block number and timestamp</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Block & Timestamp</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-2 flex-row items-center justify-start flex-wrap">
                              <div className="flex gap-2 flex-row items-center justify-start flex-wrap">
                                <Link href={`/block/${transaction.blockNumber}`} className="text-[#2563eb] hover:underline text-[14px] leading-[24px] font-normal">
                                  {transaction.blockNumber}
                                </Link>
                                <div className="inline-flex align-middle">
                                  <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.blockNumber.toString())} />
                                </div>
                              </div>
                              <div className="shrink-0 w-[1px] h-[14px] bg-gray-200"></div>
                              <div className="flex gap-2 flex-row items-center justify-start flex-wrap">
                                <div className="font-normal text-gray-700 text-[14px] leading-[24px]">{formatTimeAgo(timestamp)}</div>
                                <div className="shrink-0 h-[14px] w-[1px] text-gray-200 bg-gray-200"></div>
                                <div className="flex gap-1 flex-row items-center justify-start flex-wrap text-gray-500">
                                  <div>
                                    <div className="font-normal text-[14px] leading-[24px] text-gray-500 cursor-pointer">
                                      {formatFullTimestamp(timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Result Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Transaction result</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Result</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex flex-col gap-1 items-stretch justify-start">
                              <div className="flex gap-2 flex-row items-center justify-start flex-wrap">
                                <div className="flex justify-center items-center transition-colors flex-nowrap w-max bg-green-100 border border-green-400 text-green-600 text-[12px] leading-[16px] font-medium px-[6px] py-[1px] rounded-[6px] uppercase h-[20px] text-[10px] leading-[20px] gap-1">
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                                  Success
                                </div>
                                <div className="shrink-0 w-[1px] h-[14px] bg-gray-200"></div>
                                <div className="font-normal text-green-600 capitalize text-[14px] leading-[24px]">finalized (MAX confirmations)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Signer Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Transaction signer</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Signer</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex flex-col gap-1 items-stretch justify-start">
                              <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                                <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                  <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate">
                                    <div className="inline">
                                      <Link href={`/address/${
                                        transaction.method === "Token Created" ? ZERO_ADDRESS : transaction.fromAddress
                                      }`} className="text-current hover:underline">
                                        {transaction.method === "Token Created" ? ZERO_ADDRESS : transaction.fromAddress}
                                      </Link>
                                    </div>
                                  </span>
                                  <span className="inline-flex items-center ml-1 gap-2 align-middle">
                                    <div className="inline-flex align-middle">
                                      <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.method === "Token Created" ? ZERO_ADDRESS : transaction.fromAddress)} />
                                    </div>
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Transaction Actions Section */}
                        <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-start gap-y-0">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3 md:pt-[12px]">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Transaction actions</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                                <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Transaction Actions</div>
                                <div className="flex justify-center items-center border px-2.5 py-0.5 transition-colors flex-nowrap w-max bg-gray-100 rounded-md font-bold h-[20px] text-[10px] leading-[20px] normal-case">1 Transfer(s)</div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div dir="ltr" data-orientation="horizontal" className="w-full rounded-lg border border-gray-200 overflow-hidden">
                              <div className="tab-wrapper relative overflow-x-scroll no-scrollbar flex sm:items-center sm:justify-between gap-2 sm:flex-row w-full flex-row justify-between items-center border-b border-gray-200">
                                <div dir="ltr" className="whitespace-nowrap w-full sm:w-auto">
                                  <div role="tablist" aria-orientation="horizontal" className="items-center justify-start p-1 text-muted-foreground h-[48px] inline-flex px-4 py-0 bg-white gap-3 rounded-none border-b border-gray-200 w-full border-none" tabIndex={0} data-orientation="horizontal" style={{ outline: "none" }}>
                                    <button type="button" role="tab" aria-selected={true} className="ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap h-full py-0 px-0 bg-transparent text-sm rounded-none border-b-2 border-[#009978] font-medium data-[state=active]:shadow-none data-[state=active]:bg-transparent text-gray-700 w-full flex-1 sm:flex-auto" tabIndex={-1}>
                                      Legacy Mode
                                    </button>
                                    <button type="button" role="tab" aria-selected={false} className="ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap h-full py-0 px-0 bg-transparent text-sm rounded-none border-b-2 border-transparent font-normal data-[state=active]:shadow-none data-[state=active]:bg-transparent text-gray-400 w-full flex-1 sm:flex-auto" tabIndex={-1}>
                                      Summary Mode
                                    </button>
                                  </div>
                                </div>
                                <div className="gap-2 flex-row items-center justify-start flex-wrap hidden md:flex pr-4">
                                  <div className="gap-1 flex-row items-center justify-start flex-wrap flex">
                                    <div className="text-gray-600 text-[12px] leading-[16px]">Token Account</div>
                                    <button type="button" role="switch" aria-checked={false} className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-gray-200 hover:opacity-75">
                                      <span className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-0"></span>
                                    </button>
                                  </div>
                                  <div data-orientation="vertical" role="none" className="shrink-0 h-[16px] w-[1px] bg-gray-300"></div>
                                  <div className="flex gap-3 flex-row items-center justify-start flex-wrap cursor-pointer">
                                    <button className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold transition-colors text-white bg-[#009978] hover:bg-[#008066] disabled:opacity-40 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-[6px] text-[12px] leading-2 gap-1 h-7 px-3">
                                      <GitCompareArrows className="w-3.5 h-3.5" />
                                      Tx Maps
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1" id="render-main-action">
                                <div className="flex flex-col gap-2 items-stretch justify-start py-2">
                                  <div>
                                    <div className="flex gap-1 flex-row items-center justify-between flex-wrap px-3 sm:px-4">
                                      <div className="flex flex-row items-center justify-start flex-wrap gap-1 gap-y-[1px] w-[calc(100%-24px)]">
                                        <div className="font-normal text-gray-600 text-[14px] leading-[24px]">Interact with instruction</div>
                                        <div className="flex justify-center items-center border py-0.5 transition-colors flex-nowrap w-max bg-gray-100 rounded-md capitalize font-bold h-[20px] text-[10px] leading-[20px] px-1">
                                          <div className="text-gray-700 text-[12px] font-bold leading-[18px]">Transfer</div>
                                        </div>
                                        <div className="font-normal text-gray-600 text-[14px] leading-[24px]">on</div>
                                        <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                          <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate max-w-[250px]">
                                            <div className="inline">
                                              <Link href={`/address/${transaction.toAddress}`} className="text-current hover:underline">
                                                {shortenAddress(transaction.toAddress)}
                                              </Link>
                                            </div>
                                          </span>
                                          <span className="inline-flex items-center ml-1 gap-2 align-middle">
                                            <div className="inline-flex align-middle">
                                              <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.toAddress)} />
                                            </div>
                                          </span>
                                        </span>
                                      </div>
                                      <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                                        <ChevronDown className="w-4 h-4 text-[#2563eb] cursor-pointer transition-transform duration-300 rotate-0" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 items-stretch justify-start rounded-2xl px-3 sm:px-4">
                                    <div className="flex gap-1 flex-row items-center justify-between flex-wrap">
                                      <div className="flex flex-row items-center justify-start flex-wrap gap-1 gap-y-[1px] w-[calc(100%-24px)]">
                                        <div>
                                          <div className="flex gap-1 flex-row items-center justify-center flex-wrap h-[16px] w-[16px] rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                              <path d="M7 7h10v10" stroke="#1A90FF"></path>
                                              <path d="M7 17 17 7" stroke="#1A90FF"></path>
                                            </svg>
                                          </div>
                                        </div>
                                        <div className="font-normal text-gray-600 text-[14px] leading-[24px]">Transfer from</div>
                                        <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                          <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate max-w-[250px]">
                                            <div className="inline">
                                              <Link href={`/address/${transaction.fromAddress}`} className="text-current hover:underline">
                                                {shortenAddress(transaction.fromAddress)}
                                              </Link>
                                            </div>
                                          </span>
                                          <span className="inline-flex items-center ml-1 gap-2 align-middle">
                                            <div className="inline-flex align-middle">
                                              <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.fromAddress)} />
                                            </div>
                                          </span>
                                        </span>
                                        <div className="font-normal text-gray-600 text-[14px] leading-[24px]">to</div>
                                        <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                                          <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[#2563eb] autoTruncate max-w-[250px]">
                                            <div className="inline">
                                              <Link href={`/address/${transaction.toAddress}`} className="text-current hover:underline">
                                                {shortenAddress(transaction.toAddress)}
                                              </Link>
                                            </div>
                                          </span>
                                          <span className="inline-flex items-center ml-1 gap-2 align-middle">
                                            <div className="inline-flex align-middle">
                                              <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.toAddress)} />
                                            </div>
                                          </span>
                                        </span>
                                        <div className="font-normal text-gray-600 text-[14px] leading-[24px]">for</div>
                                        <div>
                                          <div className="text-gray-700 text-[14px] leading-[24px] font-bold">
                                            <div className="inline-flex">
                                              <span>{formatNumber(Number(transaction.amount), 6)}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <span className="whitespace-nowrap inline-flex items-center max-w-full min-w-0">
                                          <span className="inline-flex align-middle mr-1">
                                            <div className="inline-flex items-center">
                                              {transaction.token?.logoUrl ? (
                                                <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                                  <Image
                                                    src={transaction.token.logoUrl}
                                                    alt={transaction.token.symbol}
                                                    width={16}
                                                    height={16}
                                                    className="rounded-[5px] object-cover"
                                                    style={{ position: "absolute", height: "100%", objectFit: "cover", left: 0 }}
                                                  />
                                                </div>
                                              ) : (
                                                <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                                  <div className="w-full h-full bg-gray-200 rounded-[5px]"></div>
                                                </div>
                                              )}
                                            </div>
                                          </span>
                                          <span className="align-middle font-normal text-gray-600 text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all truncate px-[3px] -mx-1 rounded-sm text-[#2563eb]">
                                            <div className="inline">
                                              <Link href={`/address/${transaction.token?.tokenAddress || "#"}`} className="text-current hover:underline">
                                                {transaction.token?.symbol || "DFS"}
                                              </Link>
                                            </div>
                                          </span>
                                          <span className="inline-flex items-center ml-1 gap-2 align-middle">
                                            <div className="inline-flex align-middle">
                                              <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#2563eb]" onClick={() => handleCopy(transaction.amount)} />
                                            </div>
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Sponsored Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Sponsored banner advertisement</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Sponsored:</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-2 text-gray-600">
                              <Image
                                src="/images/ads-long.png"
                                alt="sponsor"
                                width={500}
                                height={120}
                                className="rounded-md md:h-[120px] h-[70px] w-auto cursor-pointer"
                                onClick={() => window.open("https://quickido.com", "_blank")}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Sponsored Section */}
                        <div className="flex md:flex-row flex-col pb-3 border-b border-gray-200 sm:hidden">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3 mb-2">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 font-medium" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Sponsored banner advertisement</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 font-medium">Sponsored:</div>
                            </div>
                          </div>
                          <div className="flex-1 flex gap-2 text-gray-600 px-4 sm:px-3">
                            <Image
                              src="/images/ads-long.png"
                              alt="sponsor"
                              width={500}
                              height={120}
                              className="rounded-md h-[70px] w-auto cursor-pointer"
                              onClick={() => window.open("https://quickido.com", "_blank")}
                            />
                          </div>
                        </div>
                        
                        <div className="shrink-0 w-full h-[1px] bg-gray-200"></div>
                        
                        {/* Fee Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Transaction fee</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Fee</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="font-normal text-gray-700 text-[14px] leading-[24px]">
                              <span>{formatNumber(Number(transaction.gasFee || 0), 9)}</span> DFS ($0.00)
                            </div>
                          </div>
                        </div>
                        
                        {/* Priority Fee Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Priority fee</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Priority Fee</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="font-normal text-gray-700 text-[14px] leading-[24px]">
                              <div className="inline-flex">
                                <span>0.0<sub className="text-[11px]">6</sub>566</span>
                              </div>{" "}
                              DFS ($0.00)
                            </div>
                          </div>
                        </div>
                        
                        {/* Compute Units Consumed Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Compute units consumed</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Compute Units Consumed</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="font-normal text-gray-700 capitalize text-[14px] leading-[24px]">46,837</div>
                          </div>
                        </div>
                        
                        {/* Transaction Version Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Transaction version</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Transaction Version</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="font-normal text-gray-700 capitalize text-[14px] leading-[24px]">0</div>
                          </div>
                        </div>
                        
                        {/* Recent Block Hash Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Recent block hash</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Recent Block Hash</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-stretch justify-start flex-wrap">
                              <button className="ring-offset-background focus-visible:outline-none disabled:pointer-events-none justify-center transition-colors rounded-md bg-transparent text-gray-700 hover:bg-gray-100 font-medium ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent text-[12px] leading-2 py-0 px-0 h-auto flex items-center gap-1 break-all whitespace-normal" type="button">
                                <div className="font-normal text-gray-700 text-[14px] leading-[24px] text-[#2563eb] break-all text-left">{shortenHash(transaction.transactionHash, 20)}</div>
                                <ChevronDown className="w-4 h-4 text-[#2563eb]" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Personal Label Section */}
                        <div className="flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-4 sm:-mx-3 items-stretch gap-y-0 hidden sm:flex">
                          <div className="w-full md:w-1/4 flex-shrink-0 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5 text-gray-900 md:text-gray-600 font-medium sm:font-normal" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Personal label</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-[14px] leading-[24px] text-gray-900 md:text-gray-600 font-medium md:font-normal">Personal Label</div>
                            </div>
                          </div>
                          <div className="w-full md:w-3/4 block relative box-border my-0 px-4 sm:px-3">
                            <div className="flex gap-2 flex-row items-center justify-start flex-wrap h-full">
                              <div>
                                <Link href="/login" className="text-[#2563eb] hover:underline text-[14px] leading-[24px] font-normal">
                                  Sign in to add personal label
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Balance change tab content - disabled */}
            {/* {activeTab === "balance_change" && (
              <div className="ring-offset-background focus-visible:outline-none w-full mt-0 border-none">
                <div className="flex flex-col gap-4 items-stretch justify-start">
                  <div className="rounded-xl border border-gray-200 shadow-sm p-0 bg-white overflow-hidden w-full">
                    <div className="flex flex-col gap-4 items-start justify-start">
                      <div className="px-4 py-3 sm:py-4 sm:pb-3 bg-white">
                        <div className="flex flex-col gap-1 items-stretch justify-start">
                          <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full">
                            <div className="text-[15px] leading-[24px] font-medium text-gray-700">SOL Balance Change</div>
                            <div className="flex gap-2 flex-row items-center flex-wrap justify-between w-full sm:justify-end sm:w-auto">
                              <div className="font-normal text-[14px] leading-[24px] text-gray-500 block">Show 2/9 accounts</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full px-4 pb-4">
                        <div className="text-sm text-gray-500">Balance changes will be displayed here</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
            
            {/* Raw tab content - disabled */}
            {/* {activeTab === "raw" && (
              <div className="ring-offset-background focus-visible:outline-none w-full mt-0 border-none">
                <div className="rounded-xl border border-gray-200 shadow-sm p-0 bg-white overflow-hidden w-full">
                  <div className="flex flex-col gap-4 items-start justify-start">
                    <div className="relative w-full">
                      <div className="rounded-lg overflow-y-auto break-all w-full">
                        <pre className="font-mono text-xs p-4 bg-gray-50 rounded-lg max-h-[800px] overflow-y-auto">
                          {JSON.stringify(transaction, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component with conditional rendering
export default function TransactionDetailView({ transaction }: ViewProps) {
  const { viewMode } = useViewMode();

  if (viewMode === "solanascan") {
    return <SolanaScanView transaction={transaction} />;
  }

  return <BSCScanView transaction={transaction} />;
}
