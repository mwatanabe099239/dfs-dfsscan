"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faChevronDown,
  faChevronUp,
  faQrcode,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { minidenticon } from "minidenticons";
import toast from "react-hot-toast";
import { Transaction } from "@/src/types";
import {
  getNativeBalance,
  getUserTokens,
  getTokenData,
  getTokenHolders,
  getTransactionsByAddressWithLimitWithTotalCount,
  getTokenTransactionsWithLimitWithTotalCount,
} from "@/src/lib/firebase";
import { formatTimeAgo, shortenHash } from "@/src/lib/utils";
import TokenTransactions from "./components/TokenTransactions";
import TokenHolders from "./components/TokenHolders";
import QRCode from "react-qr-code";
import Image from "next/image";
import { shortenAddress } from "@/src/lib/utils";
import { List, Star } from "lucide-react";
import { NON_USER_ADDRESS } from "@/src/lib/constant";

type AddressType = "wallet" | "token" | "invalid";

type TokenHolding = {
  address: string;
  symbol: string;
  balance: string;
  value: string;
  price: string;
  tokenAddress: string;
  name: string;
  logoUrl: string;
};

type TokenData = {
  totalSupply: string;
  holdersCount: number;
  transfersCount: number;
  symbol: string;
  name: string;
  logoUrl: string;
  website: string;
};

type TabType = "transactions" | "holders";

function getAddressType(address: string): AddressType {
  if (address.startsWith("dfs") && (address.length === 46 || NON_USER_ADDRESS.includes(address))) { 
    return "wallet";
  }
  if (address.startsWith("drc20") && address.length === 48) {
    return "token";
  }
  return "invalid";
}

export default function AddressContent({ address }: { address: string }) {
  const [loading, setLoading] = useState(true);
  const [addressType, setAddressType] = useState<AddressType>("invalid");
  const [walletData, setWalletData] = useState({
    balance: "0",
    totalTokenValue: "0",
    tokenHoldings: [] as TokenHolding[],
    transactions: {
      latest: "",
      first: "",
      total: 0,
    },
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showTokens, setShowTokens] = useState(false);
  const [searchToken, setSearchToken] = useState("");
  const [tokenData, setTokenData] = useState<TokenData>({
    totalSupply: "0",
    holdersCount: 0,
    transfersCount: 0,
    symbol: "",
    name: "",
    logoUrl: "",
    website: "",
  });
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [holders, setHolders] = useState<any[]>([]);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const type = getAddressType(address);
      setAddressType(type);

      if (type === "wallet") {
        const [{ transactions, totalCount }, balance, tokens] =
          await Promise.all([
            getTransactionsByAddressWithLimitWithTotalCount(address, 10),
            getNativeBalance(address),
            getUserTokens(address),
          ]);

        // Calculate total token value
        const totalValue = tokens.reduce(
          (sum, token) => sum + (Number(token.value) || 0),
          0
        );

        setWalletData({
          balance,
          totalTokenValue: totalValue.toFixed(2),
          tokenHoldings: tokens,
          transactions: {
            latest: transactions[0]?.createdAt
              ? formatTimeAgo(transactions[0].createdAt.getTime() / 1000)
              : "",
            first: transactions[transactions.length - 1]?.createdAt
              ? formatTimeAgo(
                  transactions[transactions.length - 1].createdAt.getTime() /
                    1000
                )
              : "",
            total: transactions.length,
          },
        });
        setTotalCount(totalCount);
        setTransactions(transactions);
      }

      if (type === "token") {
        const [
          data,
          tokenHolders,
          {
            transactions: tokenTransactions,
            totalCount: tokenTransactionsCount,
          },
        ] = await Promise.all([
          getTokenData(address),
          getTokenHolders(address),
          getTokenTransactionsWithLimitWithTotalCount(address, 10),
        ]);

        setTokenData({
          totalSupply: data?.totalSupply || "0",
          holdersCount: tokenHolders.length || 0,
          transfersCount: tokenTransactionsCount || 0,
          symbol: data?.symbol || "",
          name: data?.name || "",
          logoUrl: data?.logoUrl || "",
          website: data?.website || "",
        });
        setHolders(tokenHolders);
        setTransactions(tokenTransactions as Transaction[]);
        setTotalCount(tokenTransactionsCount);
      }

      setLoading(false);
    };

    fetchData();
  }, [address]);

  // Filter tokens based on search
  const filteredTokens = walletData.tokenHoldings.filter((token) =>
    token.symbol.toLowerCase().includes(searchToken.toLowerCase())
  );

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Copied!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleQrCodeClick = () => {
    setQrCodeModalOpen(true);
  };

  if (loading) {
    return <AddressContentSkeleton />;
  }

  if (addressType === "invalid") {
    return <div>Invalid address format</div>;
  }

  if (addressType === "wallet") {
    return (
      <>
        <div className="container mx-auto px-4">
          {/* Header with address */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-4 rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(
                    minidenticon(address)
                  )}`}
                  alt=""
                  className="w-6 h-6 rounded-full bg-gray-100"
                />
                <h1 className="text-lg">Address</h1>
                <span className="text-gray-600">{address}</span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleCopyClick}
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
              <button
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleQrCodeClick}
              >
                <FontAwesomeIcon icon={faQrcode} />
              </button>
            </div>
            <ButtonGroup />
          </div>

          <SponsorTitle />

          <FavoriteButton />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 mt-2">
            {/* Overview section */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-md p-4 h-full border border-gray-200">
                <h2 className="text-md mb-4">Overview</h2>

                {/* DFS Balance */}
                <div className="mb-4">
                  <div className="text-gray-500 text-xs">DFS BALANCE</div>
                  <div className="text-sm">{walletData.balance} DFS</div>
                </div>

                <div className="mb-4">
                  <div className="text-gray-500 text-xs">DFS VALUE</div>
                  <div className="text-sm">$0</div>
                </div>

                {/* Token Holdings with Dropdown */}
                <div className="relative">
                  <div className="text-gray-500 text-xs mb-1">
                    TOKEN HOLDINGS
                  </div>
                  <div
                    className="flex items-center justify-between p-2 border border-gray-200 rounded-md cursor-pointer"
                    onClick={() => setShowTokens(!showTokens)}
                  >
                    <div className="text-sm">
                      ${walletData.totalTokenValue} (
                      {walletData.tokenHoldings.length} Tokens)
                    </div>
                    <FontAwesomeIcon
                      icon={showTokens ? faChevronUp : faChevronDown}
                      className="text-xs"
                    />
                  </div>

                  {showTokens && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search for Token Name"
                          className="w-full p-2 border border-gray-200 rounded text-sm outline-none"
                          value={searchToken}
                          onChange={(e) => setSearchToken(e.target.value)}
                        />
                      </div>

                      {/* Token List */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {filteredTokens.length > 0 ? (
                          filteredTokens.map((token, index) => (
                            <Link
                              href={`/address/${token.tokenAddress}`}
                              key={index}
                            >
                              <div className="py-1 px-2">
                                <div
                                  className={`border-b border-gray-200 pb-2 ${
                                    index === filteredTokens.length - 1
                                      ? "border-b-0"
                                      : ""
                                  }`}
                                >
                                  <div className="flex justify-between items-center hover:bg-gray-100 p-2 rounded-md cursor-pointer text-xs">
                                    <div>
                                      <div className="text-gray-900 flex items-center gap-1">
                                        {token.logoUrl ? (
                                          <Image
                                            src={token.logoUrl}
                                            alt={token.name}
                                            width={14}
                                            height={14}
                                            className="rounded-full object-cover min-w-3 min-h-3"
                                          />
                                        ) : (
                                          <img
                                            src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                              minidenticon(token.tokenAddress)
                                            )}`}
                                            alt=""
                                            className="w-6 h-6 rounded-full bg-gray-100"
                                          />
                                        )}
                                        <span>{`DRC-20: ${token.name} (${token.symbol})`}</span>
                                      </div>
                                      <div className="text-gray-500">
                                        {token.balance} {token.symbol}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="">
                                        ${Number(token.value || 0).toFixed(2)}
                                      </div>
                                      <div className="text-gray-500">
                                        @{Number(token.price || 0).toFixed(4)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No tokens found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* More Info section */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-md p-4 h-full border border-gray-200">
                <h2 className="text-md mb-4">More Info</h2>
                {/* Private Name Tag */}
                <div className="mb-4">
                  <div className="text-gray-500 text-xs mb-1">
                    PRIVATE NAME TAGS
                  </div>
                  <button className="text-gray-600 hover:text-gray-600 cursor-pointer bg-white border border-dashed border-gray-200 rounded-xl px-3 py-1 flex items-center justify-center text-sm">
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Add
                  </button>
                </div>
                {/* Transactions */}
                <div className="mb-4">
                  <div className="text-gray-500 text-xs mb-1">TRANSACTIONS</div>
                  <div className="text-sm flex items-center gap-3">
                    <span className="">
                      Latest: {walletData.transactions.latest} ↗
                    </span>{" "}
                    <span className="">
                      First: {walletData.transactions.first} ↗
                    </span>
                  </div>
                </div>
                {/* Funded By */}
                <div className="">
                  <div className="text-gray-500 text-xs mb-1">FUNDED BY</div>
                  <div className="text-sm flex items-center gap-2">
                    <span className="text-[#0784c3] cursor-pointer">
                      {shortenAddress(address, 10)}
                    </span>
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="cursor-pointer text-gray-500"
                      onClick={handleCopyClick}
                    />
                    <span>at txn</span>
                    <span className="text-[#0784c3] cursor-pointer">
                      {shortenHash(transactions[0]?.transactionHash)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty Multichain Info section */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-md p-4 h-full border border-gray-200">
                <div className="mb-4">
                  <h2 className="text-md mb-4">Multichain Info</h2>
                  <div className="text-sm">No addresses found</div>
                </div>
                <AdsSection />
              </div>
            </div>
          </div>

          {/* Transactions Table Section */}
          <div className="">
            <div className="flex overflow-x-auto items-center gap-2 mb-4 text-sm text-gray-700">
              <button className="px-3 py-1 border border-gray-200 rounded-lg cursor-pointer bg-[#0784c3] text-white">
                Transactions
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg cursor-pointer bg-gray-200">
                NFT Transfer
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              {/* Transaction List */}
              <TokenTransactions
                transactions={transactions}
                address={address}
                totalCount={totalCount}
              />
            </div>
          </div>
        </div>

        {qrCodeModalOpen && (
          <QRCodeModal
            address={address}
            onClose={() => setQrCodeModalOpen(false)}
          />
        )}
      </>
    );
  }

  if (addressType === "token") {
    return (
      <>
        <div className="container mx-auto px-4">
          {/* Header with token address */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-4 rounded-lg">
              <div className="flex items-center gap-2">
                {tokenData.logoUrl ? (
                  <Image
                    src={tokenData.logoUrl}
                    alt={tokenData.name}
                    width={24}
                    height={24}
                    className="rounded-full h-6 w-6 object-cover"
                  />
                ) : (
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                      minidenticon(address)
                    )}`}
                    alt=""
                    className="w-6 h-6 rounded-full bg-gray-100"
                  />
                )}
                <h1 className="text-lg">Token</h1>
                <span className="text-gray-600">{address}</span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleCopyClick}
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
              <button
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={handleQrCodeClick}
              >
                <FontAwesomeIcon icon={faQrcode} />
              </button>
            </div>
            <ButtonGroup />
          </div>

          <SponsorTitle />

          <div className="flex items-center justify-end mb-2 gap-2">
            {tokenData.website ? (
              <button
                className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]"
                onClick={() => window.open(tokenData.website, "_blank")}
              >
                {tokenData.website}
              </button>
            ) : (
              <></>
            )}
            <FavoriteButton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
            {/* Overview section */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <h2 className="text-md mb-4">Overview</h2>

                {/* Total Supply */}
                <div className="mb-4">
                  <div className="text-gray-600 text-xs">TOTAL SUPPLY</div>
                  <div className="text-sm">{tokenData.totalSupply}</div>
                </div>

                {/* Holders Count */}
                <div className="mb-4">
                  <div className="text-gray-600 text-xs">HOLDERS</div>
                  <div className="text-sm">{tokenData.holdersCount}</div>
                </div>

                {/* Transfers Count */}
                <div className="">
                  <div className="text-gray-600 text-xs">TRANSFERS</div>
                  <div className="text-sm">{tokenData.transfersCount}</div>
                </div>
              </div>
            </div>

            {/* Market Info section */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <h2 className="text-md mb-4">Market Info</h2>
                <div className="text-gray-500 text-sm">Coming soon...</div>
              </div>
            </div>

            {/* Contract Info section */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <h2 className="text-md mb-4">Contract Info</h2>
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="text-gray-500">Contract:</span>
                  <span className="text-[#0784c3] truncate">{address}</span>
                  <FontAwesomeIcon
                    icon={faCopy}
                    className="cursor-pointer text-gray-500"
                    onClick={handleCopyClick}
                  />
                </div>
                <AdsSection />
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="">
            <div className="flex overflow-x-auto text-sm mb-4 gap-2">
              <button
                className={`px-3 py-1 cursor-pointer rounded-lg ${
                  activeTab === "transactions"
                    ? "bg-[#0784c3] text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("transactions")}
              >
                Transactions
              </button>
              <button
                className={`px-3 py-1 cursor-pointer rounded-lg ${
                  activeTab === "holders"
                    ? "bg-[#0784c3] text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("holders")}
              >
                Holders
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              {/* Content based on active tab */}
              {activeTab === "transactions" ? (
                <TokenTransactions
                  transactions={transactions}
                  address={address}
                  totalCount={totalCount}
                />
              ) : (
                <TokenHolders
                  holders={holders}
                  totalSupply={tokenData.totalSupply}
                  tokenAddress={address}
                />
              )}
            </div>
          </div>
        </div>

        {qrCodeModalOpen && (
          <QRCodeModal
            address={address}
            onClose={() => setQrCodeModalOpen(false)}
          />
        )}
      </>
    );
  }

  // Token address case will be implemented next
  return null;
}

function AddressContentSkeleton() {
  return (
    <div className="container mx-auto px-4 space-y-4">
      {/* Address Overview Card */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-3 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 rounded-lg gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg bg-white shadow p-4 h-32"
          >
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 p-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-24 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="p-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200">
                  {[...Array(6)].map((_, colIndex) => (
                    <td key={colIndex} className="p-2">
                      <div
                        className={`h-4 bg-gray-200 rounded animate-pulse w-full max-w-[120px]`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Skeleton */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRCodeModal({
  address,
  onClose,
}: {
  address: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-xl mx-auto fixed left-1/2 -translate-x-1/2 top-10 z-50">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          <span>Address QR Code</span>
          <button onClick={onClose} className="text-gray-500 cursor-pointer">
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        </div>
        <div className="px-8 py-4">
          <QRCode
            value={address}
            style={{ width: "240px", height: "240px" }}
            className="z-10"
          />
          <div className="text-xs text-center text-gray-700 w-60 break-words mt-4 px-2">
            {address}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ButtonGroup() {
  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="hover:bg-[#0670a6] cursor-pointer bg-[#0784c3] text-white px-2 py-1.5 rounded-md">
        Buy
      </button>
      <button className="hover:bg-[#0670a6] cursor-pointer bg-[#0784c3] text-white px-2 py-1.5 rounded-md">
        Create Earn
      </button>
      <button className="hover:bg-[#0670a6] cursor-pointer bg-[#0784c3] text-white px-2 py-1.5 rounded-md">
        Gaming
      </button>
    </div>
  );
}

export function SponsorTitle() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 font-semibold">
        Sponsored Ads Slots Available!
      </span>
      <span className="text-[#0784c3]">Book your slot here!</span>
    </div>
  );
}

function FavoriteButton() {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]">
        <Star className="w-4 h-4" />
      </button>
      <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]">
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

function AdsSection() {
  return (
    <div className="relative w-fit">
      <div className="absolute -top-2 right-5 bg-white text-black px-2 py-1 text-xs rounded-md">
        Ad
      </div>
      <Image
        src="/images/ads.png"
        alt="DFS Logo"
        className="h-full w-auto object-contain rounded-lg cursor-pointer"
        width={300}
        height={100}
        priority
        onClick={() => {
          window.open("https://quickido.com", "_blank");
        }}
      />
    </div>
  );
}
