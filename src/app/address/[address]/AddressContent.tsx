"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { minidenticon } from "minidenticons";
import toast from "react-hot-toast";
import { Transaction } from "@/src/types";
import {
  getNativeBalance,
  getTransactionsByAddress,
  getUserTokens,
  getTokenData,
  getTokenHolders,
  getTokenTransactions,
} from "@/src/lib/firebase";
import { formatTimeAgo, shortenHash, shortenAddress } from "@/src/lib/utils";
import TokenTransactions from "./components/TokenTransactions";
import TokenHolders from "./components/TokenHolders";

type AddressType = "wallet" | "token" | "invalid";

type TokenHolding = {
  address: string;
  symbol: string;
  balance: string;
  value: string;
  price: string;
  tokenAddress: string;
  name: string;
};

type TokenData = {
  totalSupply: string;
  holdersCount: number;
  transfersCount: number;
  symbol: string;
};

type TabType = "transactions" | "holders";

function getAddressType(address: string): AddressType {
  if (address.startsWith("dfs") && address.length === 46) {
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
  const [showTokens, setShowTokens] = useState(false);
  const [searchToken, setSearchToken] = useState("");
  const [tokenData, setTokenData] = useState<TokenData>({
    totalSupply: "0",
    holdersCount: 0,
    transfersCount: 0,
    symbol: "",
  });
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [holders, setHolders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const type = getAddressType(address);
      setAddressType(type);

      if (type === "wallet") {
        const [txs, balance, tokens] = await Promise.all([
          getTransactionsByAddress(address),
          getNativeBalance(address),
          getUserTokens(address),
        ]);

        const sortedTxs = txs.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

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
            latest: sortedTxs[0]?.createdAt
              ? formatTimeAgo(sortedTxs[0].createdAt.getTime() / 1000)
              : "",
            first: sortedTxs[sortedTxs.length - 1]?.createdAt
              ? formatTimeAgo(
                  sortedTxs[sortedTxs.length - 1].createdAt.getTime() / 1000
                )
              : "",
            total: sortedTxs.length,
          },
        });
        setTransactions(sortedTxs.slice(0, 25));
      }

      if (type === "token") {
        const [data, tokenHolders, tokenTransactions] = await Promise.all([
          getTokenData(address),
          getTokenHolders(address),
          getTokenTransactions(address),
        ]);
        console.log(tokenTransactions);

        setTokenData({
          totalSupply: data?.totalSupply || "0",
          holdersCount: tokenHolders.length || 0,
          transfersCount: tokenTransactions.length || 0,
          symbol: data?.symbol || "",
        });
        setHolders(tokenHolders);
        setTransactions(tokenTransactions as Transaction[]);
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
      toast.success("Address Copied");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (addressType === "invalid") {
    return <div>Invalid address format</div>;
  }

  if (addressType === "wallet") {
    return (
      <div className="space-y-4">
        {/* Header with address */}
        <div className="flex items-center gap-2 p-4 rounded-lg">
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
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                <div className="text-gray-500 text-xs mb-1">TOKEN HOLDINGS</div>
                <div
                  className="flex items-center justify-between p-2 border border-gray-200 rounded cursor-pointer"
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
                          <Link href={`/address/${token.tokenAddress}`}>
                            <div key={token.address} className="py-1 px-2">
                              <div
                                className={`border-b border-gray-200 pb-2 ${
                                  index === filteredTokens.length - 1
                                    ? "border-b-0"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between items-center hover:bg-gray-100 p-2 rounded-md cursor-pointer text-xs">
                                  <div>
                                    <div className="text-gray-900">
                                      {`DRC-20: ${token.name} (${token.symbol})`}
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

              {/* Transactions */}
              <div className="mb-4">
                <div className="text-gray-500 text-xs mb-1">TRANSACTIONS</div>
                <div className="text-sm">
                  Latest: {walletData.transactions.latest} ↗
                  <br />
                  First: {walletData.transactions.first} ↗
                </div>
              </div>
            </div>
          </div>

          {/* Empty Multichain Info section */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-4 h-full border border-gray-200">
              <h2 className="text-md mb-4">Multichain Info</h2>
              <div className="text-sm">No addresses found</div>
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button className="px-4 py-2 text-[#0784c3] border-b-2 border-[#0784c3]">
                  Transactions
                </button>
              </div>
            </div>

            {/* Transaction List */}
            <TokenTransactions transactions={transactions} address={address} />

            {/* Info Text */}
            {/* <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
                <span className="mr-1">ℹ️</span>A wallet address is a publicly
                available address that allows its owner to receive funds from
                another party. To access the funds in an address, you must have
                its private key.{" "}
                <Link
                  href="/knowledge-base"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Learn more about addresses in our Knowledge Base
                </Link>
              </div> */}
          </div>
        </div>
      </div>
    );
  }

  if (addressType === "token") {
    return (
      <div className="space-y-4">
        {/* Header with token address */}
        <div className="flex items-center gap-2 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                minidenticon(address)
              )}`}
              alt=""
              className="w-6 h-6 rounded-full bg-gray-100"
            />
            <h1 className="text-lg">Token</h1>
            <span className="text-gray-600">{address}</span>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleCopyClick}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
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
              <div className="mb-4">
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
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Contract:</span>
                <span className="text-blue-500 truncate">{address}</span>
                <FontAwesomeIcon
                  icon={faCopy}
                  className="cursor-pointer text-gray-500"
                  onClick={handleCopyClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto text-sm font-medium">
                <button
                  className={`px-4 py-2 cursor-pointer ${
                    activeTab === "transactions"
                      ? "text-[#0784c3] border-b-2 border-blue-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("transactions")}
                >
                  Transactions
                </button>
                <button
                  className={`px-4 py-2 cursor-pointer ${
                    activeTab === "holders"
                      ? "text-[#0784c3] border-b-2 border-blue-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("holders")}
                >
                  Holders
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === "transactions" ? (
              <TokenTransactions
                transactions={transactions}
                address={address}
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
    );
  }

  // Token address case will be implemented next
  return null;
}
