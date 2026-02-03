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
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle as faQuestionCircleRegular } from "@fortawesome/free-regular-svg-icons";
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
import { formatTimeAgo, shortenHash, formatNumber } from "@/src/lib/utils";
import TokenTransactions from "./components/TokenTransactions";
import TokenHolders from "./components/TokenHolders";
import QRCode from "react-qr-code";
import Image from "next/image";
import { shortenAddress } from "@/src/lib/utils";
import { List, Star, CodeXml, ChevronDown, DollarSign, Info, Tags, WalletMinimal, Copy, Tag, SlidersHorizontal, GripVertical } from "lucide-react";
import { NON_USER_ADDRESS } from "@/src/lib/constant";
import { useViewMode } from "@/src/contexts/ViewModeContext";
import SearchBar from "@/src/components/SearchBar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useDfsTokenPrice } from "@/src/hooks/useDfsTokenPrice";

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
  if (
    address.startsWith("dfs") &&
    (address.length === 46 || NON_USER_ADDRESS.includes(address))
  ) {
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
  const [tokenPrices, setTokenPrices] = useState<Record<string, { price: number; value: number }>>({});
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

        // Fetch prices for tokens with web3TokenAddress or web3WalletAddress
        const pricePromises = tokens.map(async (token: any) => {
          const web3Address = token.web3TokenAddress || token.web3WalletAddress;
          if (!web3Address) return null;

          try {
            const response = await fetch(`/api/dextool-token-price?address=${web3Address}`);
            if (response.ok) {
              const priceData = await response.json();
              const price = priceData.data?.priceUsd || 0;
              const balance = Number(token.balance || 0);
              const value = price * balance;

              return {
                tokenAddress: token.tokenAddress,
                price,
                value,
              };
            }
          } catch (error) {
            console.error(`Error fetching price for ${web3Address}:`, error);
          }
          return null;
        });

        const prices = await Promise.all(pricePromises);
        const priceMap: Record<string, { price: number; value: number }> = {};
        
        prices.forEach((priceData) => {
          if (priceData) {
            priceMap[priceData.tokenAddress] = {
              price: priceData.price,
              value: priceData.value,
            };
          }
        });

        setTokenPrices(priceMap);

        // Update token values with fetched prices
        const tokensWithPrices = tokens.map((token: any) => {
          const priceData = priceMap[token.tokenAddress];
          if (priceData) {
            return {
              ...token,
              price: priceData.price.toString(),
              value: priceData.value.toString(),
            };
          }
          return token;
        });

        // Calculate total token value
        const totalValue = tokensWithPrices.reduce(
          (sum, token) => sum + (Number(token.value) || 0),
          0
        );

        setWalletData({
          balance,
          totalTokenValue: totalValue.toFixed(2),
          tokenHoldings: tokensWithPrices,
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

  const { viewMode } = useViewMode();

  if (addressType === "wallet") {
    if (viewMode === "solanascan") {
      return (
        <SolanaScanWalletView
          address={address}
          walletData={walletData}
          transactions={transactions}
          totalCount={totalCount}
          filteredTokens={filteredTokens}
          showTokens={showTokens}
          setShowTokens={setShowTokens}
          searchToken={searchToken}
          setSearchToken={setSearchToken}
          qrCodeModalOpen={qrCodeModalOpen}
          setQrCodeModalOpen={setQrCodeModalOpen}
          handleCopyClick={handleCopyClick}
        />
      );
    }

    return (
      <BSCScanWalletView
        address={address}
        walletData={walletData}
        transactions={transactions}
        totalCount={totalCount}
        filteredTokens={filteredTokens}
        showTokens={showTokens}
        setShowTokens={setShowTokens}
        searchToken={searchToken}
        setSearchToken={setSearchToken}
        qrCodeModalOpen={qrCodeModalOpen}
        setQrCodeModalOpen={setQrCodeModalOpen}
        handleCopyClick={handleCopyClick}
      />
    );
  }

  if (addressType === "token") {
    if (viewMode === "solanascan") {
      return (
        <SolanaScanTokenView
          address={address}
          tokenData={tokenData}
          transactions={transactions}
          totalCount={totalCount}
          holders={holders}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          qrCodeModalOpen={qrCodeModalOpen}
          setQrCodeModalOpen={setQrCodeModalOpen}
          handleCopyClick={handleCopyClick}
        />
      );
    }

    return (
      <BSCScanTokenView
        address={address}
        tokenData={tokenData}
        transactions={transactions}
        totalCount={totalCount}
        holders={holders}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        qrCodeModalOpen={qrCodeModalOpen}
        setQrCodeModalOpen={setQrCodeModalOpen}
        handleCopyClick={handleCopyClick}
      />
    );
  }

  return null;
}

// BSCScan Wallet View
function BSCScanWalletView({
  address,
  walletData,
  transactions,
  totalCount,
  filteredTokens,
  showTokens,
  setShowTokens,
  searchToken,
  setSearchToken,
  qrCodeModalOpen,
  setQrCodeModalOpen,
  handleCopyClick,
}: {
  address: string;
  walletData: any;
  transactions: Transaction[];
  totalCount: number;
  filteredTokens: TokenHolding[];
  showTokens: boolean;
  setShowTokens: (show: boolean) => void;
  searchToken: string;
  setSearchToken: (token: string) => void;
  qrCodeModalOpen: boolean;
  setQrCodeModalOpen: (open: boolean) => void;
  handleCopyClick: () => void;
}) {
  const { data: dfsPriceData } = useDfsTokenPrice();
  const dfsPrice = dfsPriceData.priceData?.priceUsd || 0;
  const dfsValue = Number(walletData.balance || 0) * dfsPrice;

  const handleQrCodeClick = () => {
    setQrCodeModalOpen(true);
  };

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
                  <div className="text-sm">${formatNumber(dfsValue, 2)}</div>
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
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                      {transactions[0]?.transactionHash
                        ? shortenHash(transactions[0]?.transactionHash)
                        : ""}
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

// BSCScan Token View
function BSCScanTokenView({
  address,
  tokenData,
  transactions,
  totalCount,
  holders,
  activeTab,
  setActiveTab,
  qrCodeModalOpen,
  setQrCodeModalOpen,
  handleCopyClick,
}: {
  address: string;
  tokenData: TokenData;
  transactions: Transaction[];
  totalCount: number;
  holders: any[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  qrCodeModalOpen: boolean;
  setQrCodeModalOpen: (open: boolean) => void;
  handleCopyClick: () => void;
}) {
  const handleQrCodeClick = () => {
    setQrCodeModalOpen(true);
  };

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
                <span className="text-gray-600">
                  {tokenData.name} ({tokenData.symbol})
                </span>
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

// SolanaScan Wallet View
function SolanaScanWalletView({
  address,
  walletData,
  transactions,
  totalCount,
  filteredTokens,
  showTokens,
  setShowTokens,
  searchToken,
  setSearchToken,
  qrCodeModalOpen,
  setQrCodeModalOpen,
  handleCopyClick,
}: {
  address: string;
  walletData: any;
  transactions: Transaction[];
  totalCount: number;
  filteredTokens: TokenHolding[];
  showTokens: boolean;
  setShowTokens: (show: boolean) => void;
  searchToken: string;
  setSearchToken: (token: string) => void;
  qrCodeModalOpen: boolean;
  setQrCodeModalOpen: (open: boolean) => void;
  handleCopyClick: () => void;
}) {
  const [activeTab, setActiveTab] = useState("transactions");
  const [hideSpam, setHideSpam] = useState(false);
  const [hideFailed, setHideFailed] = useState(false);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Default values
  const defaultColumnOrder = [
    "preview",
    "signature",
    "block",
    "time",
    "action",
    "instructions",
    "by",
    "value",
    "fee",
  ];
  const defaultColumnVisibility = {
    preview: true,
    signature: true,
    block: false,
    time: true,
    action: true,
    instructions: false,
    by: true,
    value: true,
    fee: false,
  };

  // Load from localStorage or use defaults (lazy initializer)
  const loadColumnOrder = (): string[] => {
    if (typeof window === "undefined") {
      return defaultColumnOrder;
    }
    try {
      const savedOrder = localStorage.getItem("tableColumnOrder");
      return savedOrder ? JSON.parse(savedOrder) : defaultColumnOrder;
    } catch (error) {
      console.error("Error loading column order:", error);
      return defaultColumnOrder;
    }
  };

  const loadColumnVisibility = () => {
    if (typeof window === "undefined") {
      return defaultColumnVisibility;
    }
    try {
      const savedVisibility = localStorage.getItem("tableColumnVisibility");
      return savedVisibility ? JSON.parse(savedVisibility) : defaultColumnVisibility;
    } catch (error) {
      console.error("Error loading column visibility:", error);
      return defaultColumnVisibility;
    }
  };

  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>(loadColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibility);
  const [tempColumnVisibility, setTempColumnVisibility] = useState(loadColumnVisibility);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { data: dfsPriceData } = useDfsTokenPrice();
  const dfsPrice = dfsPriceData.priceData?.priceUsd || 0;
  const dfsValue = Number(walletData.balance || 0) * dfsPrice;
  const totalValue = dfsValue + Number(walletData.totalTokenValue || 0);
  
  const handleQrCodeClick = () => {
    setQrCodeModalOpen(true);
  };

  const handleResetColumns = () => {
    setTempColumnVisibility(defaultColumnVisibility);
    setTempColumnOrder(defaultColumnOrder);
  };

  const handleApplyColumns = () => {
    setColumnVisibility(tempColumnVisibility);
    setColumnOrder(tempColumnOrder);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tableColumnOrder", JSON.stringify(tempColumnOrder));
        localStorage.setItem("tableColumnVisibility", JSON.stringify(tempColumnVisibility));
      } catch (error) {
        console.error("Error saving column settings:", error);
      }
    }
    
    setShowColumnMenu(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = [...tempColumnOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    setTempColumnOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="my-8 mx-auto max-w-full px-4 md:px-6 2xl:px-0 2xl:max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-start mb-4 gap-2 sm:gap-4">
        <div className="flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-0 w-full gap-y-2 sm:gap-y-4 flex flex-col-reverse sm:flex-row sm:items-center">
          <div className="max-w-24/24 md:max-w-12/24 flex-24/24 md:flex-12/24 block relative box-border my-0 px-0">
            <div className="flex flex-row items-center justify-start flex-wrap gap-2 sm:gap-3">
              <h4 className="not-italic text-gray-900 text-[22px] leading-[28px] font-medium">
                <div className="flex flex-row items-center justify-start flex-wrap gap-2">
                  <div className="gap-1 flex-row items-center justify-start flex-wrap flex sm:hidden">
                    <div 
                      className="rounded-full inline-block overflow-hidden"
                      style={{ backgroundColor: 'rgb(1, 132, 140)', height: '20px', width: '20px' }}
                    >
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(minidenticon(address))}`}
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  Account
                </div>
              </h4>
            </div>
          </div>
          <div className="md:max-w-12/24 max-w-24/24 md:flex-12/24 flex-24/24 block relative box-border my-0 px-0 lg:flex lg:justify-end">
            <div className="w-full sm:max-w-[458px]">
              <SearchBar />
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 gap-y-2 sm:gap-y-4 items-end">
            <div className="max-w-24/24 lg:max-w-12/24 flex-24/24 lg:flex-12/24 block relative box-border my-0 px-1">
              <div className="flex gap-2 flex-row items-center justify-start flex-wrap w-full">
                <div className="gap-1 flex-row items-center justify-start flex-wrap hidden sm:flex flex-shrink-0">
                  <div 
                    className="rounded-full inline-block overflow-hidden"
                    style={{ backgroundColor: 'rgb(1, 132, 140)', height: '20px', width: '20px' }}
                  >
                    <img
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(minidenticon(address))}`}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="break-all font-normal text-gray-700 text-[14px] sm:text-[16px] align-middle">{address}</span>
                  <span className="inline-flex items-center gap-2 ml-2 align-middle">
                    <div className="inline-flex align-middle">
                      <Copy className="w-[18px] h-[18px] cursor-pointer text-[#adb5bd] hover:text-[#21f201]" onClick={handleCopyClick} />
                    </div>
                    <div className="inline-flex cursor-pointer" onClick={handleQrCodeClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:cursor-pointer text-[#adb5bd] hover:text-[#21f201]">
                        <rect width="5" height="5" x="3" y="3" rx="1"></rect>
                        <rect width="5" height="5" x="16" y="3" rx="1"></rect>
                        <rect width="5" height="5" x="3" y="16" rx="1"></rect>
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                        <path d="M21 21v.01"></path>
                        <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                        <path d="M3 12h.01"></path>
                        <path d="M12 3h.01"></path>
                        <path d="M12 16v.01"></path>
                        <path d="M16 12h1"></path>
                        <path d="M21 12v.01"></path>
                        <path d="M12 21v-1"></path>
                      </svg>
                    </div>
                    <div className="inline-flex">
                      <div 
                        className="px-2 py-1 flex items-center gap-1 rounded-full cursor-pointer"
                        style={{ background: 'linear-gradient(91.71deg, rgb(241, 52, 255) -21.92%, rgb(0, 212, 160) 100%)' }}
                      >
                        <DollarSign className="w-[18px] h-[18px] cursor-pointer text-white" />
                        <div className="not-italic text-[14px] leading-[24px] text-white font-bold">Tip</div>
                      </div>
                    </div>
                  </span>
                </div>
              </div>
            </div>
            <div className="max-w-24/24 lg:max-w-12/24 flex-24/24 lg:flex-12/24 relative box-border my-0 px-1 flex justify-start lg:justify-end">
              <div className="w-full lg:w-[458px]">
                <div className="flex flex-row items-center justify-between flex-wrap gap-1 sm:gap-3 w-full sm:w-auto">
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="text-inherit hidden sm:block">
                        <path d="M14.6667 14.1665C14.6667 14.4398 14.44 14.6665 14.1667 14.6665H1.83333C1.55999 14.6665 1.33333 14.4398 1.33333 14.1665C1.33333 13.8932 1.55999 13.6665 1.83333 13.6665H14.1667C14.44 13.6665 14.6667 13.8932 14.6667 14.1665Z" fill="currentColor"></path>
                        <path d="M10.26 3.01353L3.10001 10.1735C2.82668 10.4469 2.61331 10.6668 2.12001 10.1735H2.11335C1.18668 9.2402 0.333331 8.58686 2.11335 6.80687L6.88001 2.0402C8.58669 0.333508 9.32001 1.10687 10.2533 2.0402C10.6667 2.45352 10.5267 2.74687 10.26 3.01353Z" fill="currentColor"></path>
                        <path d="M13.88 5.66021L11.8467 3.62687C11.5733 3.35354 11.1333 3.35354 10.8667 3.62687L3.70666 10.7869C3.43333 11.0535 3.43333 11.4935 3.70666 11.7669L5.74 13.8069C6.67333 14.7335 8.18 14.7335 9.11333 13.8069L13.8733 9.04021C15 7.91354 15.3333 7.11354 13.88 5.66021ZM8.50666 11.6802L7.7 12.4935C7.53333 12.6602 7.26 12.6602 7.08666 12.4935C6.92 12.3269 6.92 12.0535 7.08666 11.8802L7.9 11.0669C8.06 10.9069 8.34 10.9069 8.50666 11.0669C8.67333 11.2335 8.67333 11.5202 8.50666 11.6802ZM11.1533 9.03354L9.52666 10.6669C9.36 10.8269 9.08666 10.8269 8.91333 10.6669C8.74666 10.5002 8.74666 10.2269 8.91333 10.0535L10.5467 8.42021C10.7067 8.26021 10.9867 8.26021 11.1533 8.42021C11.32 8.59354 11.32 8.86688 11.1533 9.03354Z" fill="currentColor"></path>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Buy</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" className="text-inherit hidden sm:block">
                        <path d="M6.33334 9.76699V11.567C6.33334 13.067 5.73334 13.667 4.23334 13.667H2.43334C0.933336 13.667 0.333336 13.067 0.333336 11.567V9.76699C0.333336 8.26699 0.933336 7.66699 2.43334 7.66699H4.23334C5.73334 7.66699 6.33334 8.26699 6.33334 9.76699Z" fill="currentColor"></path>
                        <path d="M10.6667 6.3335C12.3235 6.3335 13.6667 4.99035 13.6667 3.3335C13.6667 1.67664 12.3235 0.333496 10.6667 0.333496C9.00982 0.333496 7.66667 1.67664 7.66667 3.3335C7.66667 4.99035 9.00982 6.3335 10.6667 6.3335Z" fill="currentColor"></path>
                        <path d="M8.85332 13.6667C8.67332 13.6667 8.50665 13.5667 8.41999 13.4133C8.33332 13.2533 8.33332 13.0667 8.42665 12.9067L9.07332 11.8267C9.21332 11.5867 9.51999 11.5133 9.75999 11.6533C9.99999 11.7933 10.0733 12.1 9.93332 12.34L9.81332 12.54C11.46 12.1133 12.6733 10.62 12.6733 8.84668C12.6733 8.57335 12.9 8.34668 13.1733 8.34668C13.4467 8.34668 13.6667 8.57335 13.6667 8.85335C13.6667 11.5067 11.5067 13.6667 8.85332 13.6667Z" fill="currentColor"></path>
                        <path d="M0.833336 5.64683C0.560003 5.64683 0.333336 5.42683 0.333336 5.14683C0.333336 2.4935 2.49334 0.333496 5.14667 0.333496C5.33334 0.333496 5.49334 0.433496 5.58667 0.58683C5.67334 0.74683 5.67334 0.933496 5.58 1.0935L4.93334 2.16683C4.78667 2.40683 4.48 2.48683 4.24667 2.34016C4.00667 2.20016 3.93334 1.8935 4.07334 1.6535L4.19334 1.4535C2.55334 1.88016 1.33334 3.3735 1.33334 5.14683C1.33334 5.42683 1.10667 5.64683 0.833336 5.64683Z" fill="currentColor"></path>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Presale</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit w-4 h-4 hidden sm:block">
                        <path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z"></path>
                        <path d="M12 17v4"></path>
                        <path d="M8 21h8"></path>
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Play</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" className="text-inherit hidden sm:block">
                        <path d="M15.8333 10.4208C15.799 8.50726 15.5729 6.57224 15.2023 4.61916C14.9003 3.26221 13.8141 2.05364 12.0784 1.96513C10.7971 1.91242 10.5493 2.64231 9.09755 2.62828C8.69994 2.6257 8.30263 2.6257 7.90502 2.62828C6.45297 2.64231 6.20461 1.91242 4.92385 1.96513C3.18791 2.05364 2.06786 3.25906 1.79888 4.61916C1.42791 6.57224 1.2019 8.50697 1.16781 10.4205C1.1595 11.7528 2.47492 12.6391 3.34289 12.6999C5.01953 12.8265 6.35156 9.86994 7.36648 9.86966C8.12302 9.87395 8.87927 9.87424 9.6358 9.86966C10.651 9.86966 11.9819 12.8268 13.6597 12.7002C14.5274 12.6394 15.8769 11.7471 15.8336 10.4208H15.8333ZM6.6363 6.68711H5.85427V7.46914C5.85427 7.79914 5.58672 8.06669 5.25672 8.06669C4.92672 8.06669 4.65916 7.79914 4.65916 7.46914V6.68711H3.87713C3.54713 6.68711 3.27958 6.41955 3.27958 6.08955C3.27958 5.75955 3.54713 5.492 3.87713 5.492H4.65916V4.70997C4.65916 4.37997 4.92672 4.11242 5.25672 4.11242C5.58672 4.11242 5.85427 4.37997 5.85427 4.70997V5.492H6.6363C6.9663 5.492 7.23385 5.75955 7.23385 6.08955C7.23385 6.41955 6.9663 6.68711 6.6363 6.68711ZM11.4651 8.0664C10.9973 8.07901 10.6083 7.70948 10.5957 7.24197C10.5834 6.77276 10.9532 6.38317 11.4207 6.37114C11.8888 6.3594 12.2784 6.72864 12.2904 7.19671C12.3022 7.66479 11.9329 8.05437 11.4651 8.0664ZM12.8759 5.80768C12.4081 5.82086 12.0183 5.45104 12.0054 4.98325C11.9936 4.51461 12.3629 4.1256 12.831 4.1127C13.2996 4.10039 13.6886 4.4702 13.7012 4.93828C13.7135 5.40606 13.3434 5.79593 12.8759 5.80768Z" fill="currentColor"></path>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Gaming</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Utility Icons Row */}
        <div className="w-full flex items-center justify-end gap-2">
          <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]">
            <Star className="w-4 h-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px] gap-1">
            <CodeXml className="w-4 h-4" />
            <span className="text-xs">API</span>
          </button>
          <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]">
            <List className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Main Cards Section */}
      <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border gap-y-4 -mx-1.5 items-stretch mb-4">
        {/* Overview Card */}
        <div className="max-w-24/24 md:max-w-12/24 lg:max-w-8/24 flex-24/24 md:flex-12/24 lg:flex-8/24 block relative box-border my-0 px-1.5">
          <div className="rounded-xl border border-gray-200 shadow-md bg-white p-4 lg h-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full mb-4">
              <div className="not-italic text-[15px] leading-[24px] font-medium text-gray-700">Overview</div>
            </div>
            <div className="flex flex-col gap-4 items-start justify-start">
              {/* Total Value */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Total Value</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">${formatNumber(totalValue, 2)}</div>
                  </div>
                </div>
              </div>
              
              {/* DFS Balance */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">DFS Balance</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">
                      <span>{formatNumber(Number(walletData.balance || 0), 9)}</span>
                    </div>
                    <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">DFS</div>
                    <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">(${formatNumber(dfsValue, 2)})</div>
                  </div>
                </div>
              </div>
              
              {/* Token Balance */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Token Balance</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">{walletData.tokenHoldings.length} Tokens</div>
                    <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                      <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">($<span>{formatNumber(Number(walletData.totalTokenValue || 0), 2)}</span>)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Token Display Box with Dropdown */}
              {walletData.tokenHoldings.length > 0 && (
                <div className="relative w-full">
                  <div className="flex gap-2 flex-row justify-start flex-nowrap w-full items-stretch">
                    <div 
                      className="border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg flex justify-between items-center cursor-pointer flex-1 hover:bg-gray-100 transition-colors max-w-[calc(100%-52px)]"
                      onClick={() => setShowTokens(!showTokens)}
                    >
                      <div className="flex gap-1 flex-row items-center justify-start flex-nowrap max-w-[calc(100%-24px)]">
                        <span className="whitespace-nowrap inline-flex items-center max-w-full min-w-0 flex-1 truncate">
                          {walletData.tokenHoldings[0]?.logoUrl && (
                            <span className="inline-flex align-middle mr-1">
                              <div className="inline-flex items-center">
                                <span>
                                  <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                    <Image
                                      src={walletData.tokenHoldings[0].logoUrl}
                                      alt={walletData.tokenHoldings[0].symbol}
                                      width={16}
                                      height={16}
                                      className="rounded-[5px] absolute h-full object-cover left-0"
                                    />
                                  </div>
                                </span>
                              </div>
                            </span>
                          )}
                          <span className="align-middle text-gray-700 text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all truncate px-[3px] -mx-1 rounded-sm text-blue-600 font-bold">
                            {formatNumber(Number(walletData.tokenHoldings[0]?.value || 0) / 1000, 2)}K&nbsp;
                            <span className="text-current">{walletData.tokenHoldings[0]?.symbol || "USDT"}</span>
                          </span>
                        </span>
                        <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">(~${formatNumber(Number(walletData.tokenHoldings[0]?.value || 0) / 1000, 2)}K)</div>
                        <div>
                          <Info className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                      <div className="gap-3 flex-row items-center justify-start flex-wrap hidden sm:flex">
                        <ChevronDown className={`w-4 h-4 transition-transform ${showTokens ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className="h-full">
                      <div className="cursor-pointer rounded-lg w-full bg-gray-50 hover:bg-gray-100 flex justify-center items-center h-full px-3 py-2 border border-gray-200">
                        <WalletMinimal className="w-6 h-6 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Token Dropdown */}
                  {showTokens && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
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
              )}
            </div>
          </div>
        </div>

        {/* More info Card */}
        <div className="max-w-24/24 md:max-w-12/24 lg:max-w-8/24 flex-24/24 md:flex-12/24 lg:flex-8/24 block relative box-border my-0 px-1.5">
          <div className="rounded-xl border border-gray-200 shadow-md bg-white p-4 lg h-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full mb-4">
              <div className="not-italic text-[15px] leading-[24px] font-medium text-gray-700">More info</div>
            </div>
            <div className="flex flex-col gap-4 items-start justify-start">
              {/* Owner */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Owner</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                    <span className="inline-flex items-center align-middle mr-1">
                      <div className="inline">
                        <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                          <img alt="solana" src="https://statics.solscan.io/solscan-img/solana_icon.svg" className="rounded-[5px] absolute h-full object-contain left-0" width={16} height={16} />
                        </div>
                      </div>
                    </span>
                    <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-blue-600">
                      <Link href="/account/11111111111111111111111111111111" className="text-current">System Program</Link>
                    </span>
                    <span className="inline-flex items-center ml-1 gap-2 align-middle">
                      <div className="inline-flex align-middle">
                        <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#21f201]" />
                      </div>
                    </span>
                  </span>
                </div>
              </div>
              
              {/* isOnCurve */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500 flex items-center gap-1">
                    isOnCurve <Info className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1 self-center">
                  <div className="flex justify-center items-center transition-colors flex-nowrap w-max bg-green-100 border border-green-400 text-green-600 text-[12px] leading-[16px] font-medium px-[6px] py-[1px] rounded-[6px] uppercase h-[20px]">
                    True
                  </div>
                </div>
              </div>
              
              {/* Stake */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500 inline-block">Stake</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">
                      <span>0</span> DFS
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0 items-center">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500 inline-block">Tags</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="gap-1 flex-row items-stretch justify-start flex-wrap inline-flex">
                    <div className="flex gap-1 flex-row items-center justify-start flex-wrap h-full">
                      <button type="button" className="justify-center rounded-full border px-2.5 py-0.5 transition-colors flex-nowrap w-max bg-white border-gray-200 font-bold h-[20px] text-[10px] leading-[20px] flex gap-1 items-center cursor-pointer hover:border-[#21f201]">
                        <Tags className="w-3.5 h-3.5" />
                        Extra Tags
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Funded by */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0 items-center">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500 inline-block">Funded by</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <button type="button" className="w-full">
                    <div className="flex items-center font-medium transition-colors flex-nowrap py-2 rounded-md bg-white border border-gray-200 h-[24px] text-[14px] leading-[25px] gap-0 px-1.5 justify-between w-full">
                      <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full">
                        <span className="w-auto inline-flex items-center whitespace-nowrap max-w-[calc(100%-20px)] truncate">
                          <span className="inline-flex items-center align-middle mr-1">
                            <div className="inline-flex align-middle gap-1">
                              <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                <img alt="binance" src="https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f737461746963732e736f6c7363616e2e696f2f736f6c7363616e2d696d672f62696e616e63652e6a7067" className="rounded-[5px] absolute h-full object-cover left-0" width={16} height={16} />
                              </div>
                            </div>
                          </span>
                          <span className="align-middle font-normal border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-[12px]">
                            <span>Binance 2</span>
                          </span>
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Misc Card */}
        <div className="max-w-24/24 md:max-w-24/24 lg:max-w-8/24 flex-24/24 md:flex-24/24 lg:flex-8/24 block relative box-border my-0 px-1.5">
          <div className="rounded-xl border border-gray-200 shadow-md bg-white p-4 lg h-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full mb-4">
              <div className="not-italic text-[15px] leading-[24px] font-medium text-gray-700">Misc</div>
            </div>
            <div className="flex flex-col gap-4 items-start justify-start">
              {/* Personal label */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border gap-y-4 -mx-1 w-full">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Personal label</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <Link href="/user/signin">
                    <div className="flex gap-1 flex-row items-center justify-start flex-wrap cursor-pointer text-blue-600 w-fit">
                      <Tag className="w-4 h-4" />
                      <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px] text-blue-600">Sign in to add personal label</div>
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Ad Section */}
              <div className="w-full overflow-x-auto overflow-y-hidden inline-flex pt-2 justify-start">
                <div className="relative inline-block">
                  <span className="absolute bg-white text-gray-900 shadow-md rounded-md text-xs px-1 right-5 -top-2">Ad</span>
                  <Image
                    src="/images/ads.png"
                    alt="sponsor"
                    width={300}
                    height={100}
                    className="rounded-md h-auto w-auto cursor-pointer"
                    onClick={() => window.open("https://quickido.com", "_blank")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tab-wrapper relative overflow-x-scroll no-scrollbar flex items-start sm:items-center sm:justify-between gap-2 flex-col sm:flex-row mb-3 w-full">
        <div dir="ltr" className="w-auto whitespace-nowrap" style={{ position: "relative", "--radix-scroll-area-corner-width": "0px", "--radix-scroll-area-corner-height": "0px" } as React.CSSProperties}>
          <div 
            role="tablist" 
            aria-orientation="horizontal" 
            className="items-center justify-start rounded-md text-gray-500 h-auto inline-flex bg-transparent p-0 w-full"
            tabIndex={0}
            data-orientation="horizontal"
            style={{ outline: "none" }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={true}
              aria-controls="radix-tab-content-transactions"
              data-state="active"
              id="radix-tab-trigger-transactions"
              className="py-1.5 font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-xs text-gray-700 data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:!bg-[#009978] data-[state=active]:hover:!bg-[#008066] ml-2 first:ml-0 transition-colors duration-200 px-3 h-7 w-full"
              tabIndex={0}
              data-orientation="horizontal"
              data-radix-collection-item=""
            >
              Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 flex-row items-center justify-end flex-nowrap">
            {/* Desktop Filters */}
            <div className="lg:flex gap-2 hidden">
              {/* Hide Spam Txs */}
              <div className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50">
                <Info className="w-3.5 h-3.5 text-gray-700" />
                Hide Spam Txs
                <button
                  type="button"
                  role="switch"
                  aria-checked={hideSpam}
                  data-state={hideSpam ? "checked" : "unchecked"}
                  value="on"
                  onClick={() => setHideSpam(!hideSpam)}
                  className="peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#21f201] data-[state=checked]:hover:bg-[#1bd301] data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300"
                >
                  <span
                    data-state={hideSpam ? "checked" : "unchecked"}
                    className="pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
                  />
                </button>
              </div>
              
              {/* Hide Failed */}
              <div className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50">
                <Info className="w-3.5 h-3.5 text-gray-700" />
                Hide Failed
                <button
                  type="button"
                  role="switch"
                  aria-checked={hideFailed}
                  data-state={hideFailed ? "checked" : "unchecked"}
                  value="on"
                  onClick={() => setHideFailed(!hideFailed)}
                  className="peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#21f201] data-[state=checked]:hover:bg-[#1bd301] data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300"
                >
                  <span
                    data-state={hideFailed ? "checked" : "unchecked"}
                    className="pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
                  />
                </button>
              </div>
              
              {/* Oldest First */}
              <div className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50">
                <Info className="w-3.5 h-3.5 text-gray-700" />
                Oldest First
                <button
                  type="button"
                  role="switch"
                  aria-checked={oldestFirst}
                  data-state={oldestFirst ? "checked" : "unchecked"}
                  value="on"
                  onClick={() => setOldestFirst(!oldestFirst)}
                  className="peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#21f201] data-[state=checked]:hover:bg-[#1bd301] data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300"
                >
                  <span
                    data-state={oldestFirst ? "checked" : "unchecked"}
                    className="pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
                  />
                </button>
              </div>
            </div>
            
            {/* Mobile Filter Button */}
            <div className="gap-2 flex-row items-center justify-end flex-wrap lg:hidden flex">
              <button
                type="button"
                className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 cursor-pointer text-inherit" />
              </button>
            </div>
            
            {/* Right Side Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTempColumnVisibility(columnVisibility);
                  setTempColumnOrder(columnOrder);
                  setShowColumnMenu(!showColumnMenu);
                }}
                className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold h-auto transition-colors border border-gray-200 hover:bg-gray-100 text-gray-700 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-1.5 text-[12px] leading-[18px] gap-0.5 px-1.5 h-[28px] bg-gray-50"
              >
                <GripVertical className="w-3.5 h-3.5" />
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Column Customization Dropdown */}
              {showColumnMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColumnMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-[280px]">
                    {/* Column List */}
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                      {tempColumnOrder.map((columnKey: string, index: number) => {
                        const columnMap: Record<string, string> = {
                          preview: "Preview",
                          signature: "Transaction Hash",
                          block: "Block",
                          time: "Time",
                          action: "Action",
                          instructions: "Instructions",
                          by: "By",
                          value: "Value",
                          fee: "Fee (DFS)",
                        };
                        const column = { key: columnKey, label: columnMap[columnKey] };
                        const isDragging = draggedIndex === index;
                        const isDragOver = dragOverIndex === index;

                        return (
                          <div
                            key={column.key}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded cursor-move transition-colors ${
                              isDragging ? "opacity-50" : ""
                            } ${isDragOver ? "bg-blue-50 border-t-2 border-blue-500" : ""}`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="checkbox"
                                checked={tempColumnVisibility[column.key as keyof typeof tempColumnVisibility]}
                                onChange={(e) =>
                                  setTempColumnVisibility({
                                    ...tempColumnVisibility,
                                    [column.key]: e.target.checked,
                                  })
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-[#21f201] border-gray-300 rounded focus:ring-[#21f201] cursor-pointer"
                              />
                              <span className="text-sm text-gray-700">{column.label}</span>
                            </div>
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200" />

                    {/* Action Buttons */}
                    <div className="p-4 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={handleResetColumns}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyColumns}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#21f201] hover:bg-[#1bd301] rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <TokenTransactions
            transactions={transactions}
            address={address}
            totalCount={totalCount}
            hideHeader={true}
            isSolanaScan={true}
            columnOrder={columnOrder}
            columnVisibility={columnVisibility}
          />
        </div>
      </div>

      {qrCodeModalOpen && (
        <QRCodeModal
          address={address}
          onClose={() => setQrCodeModalOpen(false)}
        />
      )}
    </div>
  );
}

// SolanaScan Token View
function SolanaScanTokenView({
  address,
  tokenData,
  transactions,
  totalCount,
  holders,
  activeTab,
  setActiveTab,
  qrCodeModalOpen,
  setQrCodeModalOpen,
  handleCopyClick,
}: {
  address: string;
  tokenData: TokenData;
  transactions: Transaction[];
  totalCount: number;
  holders: any[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  qrCodeModalOpen: boolean;
  setQrCodeModalOpen: (open: boolean) => void;
  handleCopyClick: () => void;
}) {
  const [hideSpam, setHideSpam] = useState(false);
  const [hideFailed, setHideFailed] = useState(false);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Default values
  const defaultColumnOrder = [
    "preview",
    "signature",
    "block",
    "time",
    "action",
    "instructions",
    "by",
    "value",
    "fee",
  ];
  const defaultColumnVisibility = {
    preview: true,
    signature: true,
    block: false,
    time: true,
    action: true,
    instructions: false,
    by: true,
    value: true,
    fee: false,
  };

  // Load from localStorage or use defaults (lazy initializer)
  const loadColumnOrder = (): string[] => {
    if (typeof window === "undefined") {
      return defaultColumnOrder;
    }
    try {
      const savedOrder = localStorage.getItem("tableColumnOrder");
      return savedOrder ? JSON.parse(savedOrder) : defaultColumnOrder;
    } catch (error) {
      console.error("Error loading column order:", error);
      return defaultColumnOrder;
    }
  };

  const loadColumnVisibility = () => {
    if (typeof window === "undefined") {
      return defaultColumnVisibility;
    }
    try {
      const savedVisibility = localStorage.getItem("tableColumnVisibility");
      return savedVisibility ? JSON.parse(savedVisibility) : defaultColumnVisibility;
    } catch (error) {
      console.error("Error loading column visibility:", error);
      return defaultColumnVisibility;
    }
  };

  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [tempColumnOrder, setTempColumnOrder] = useState<string[]>(loadColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibility);
  const [tempColumnVisibility, setTempColumnVisibility] = useState(loadColumnVisibility);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleQrCodeClick = () => {
    setQrCodeModalOpen(true);
  };

  const handleResetColumns = () => {
    setTempColumnVisibility(defaultColumnVisibility);
    setTempColumnOrder(defaultColumnOrder);
  };

  const handleApplyColumns = () => {
    setColumnVisibility(tempColumnVisibility);
    setColumnOrder(tempColumnOrder);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tableColumnOrder", JSON.stringify(tempColumnOrder));
        localStorage.setItem("tableColumnVisibility", JSON.stringify(tempColumnVisibility));
      } catch (error) {
        console.error("Error saving column settings:", error);
      }
    }
    
    setShowColumnMenu(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = [...tempColumnOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    setTempColumnOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="my-8 mx-auto max-w-full px-4 md:px-6 2xl:px-0 2xl:max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-start mb-4 gap-2 sm:gap-4">
        <div className="flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-0 w-full gap-y-2 sm:gap-y-4 flex flex-col-reverse sm:flex-row sm:items-center">
          <div className="max-w-24/24 md:max-w-12/24 flex-24/24 md:flex-12/24 block relative box-border my-0 px-0">
            <div className="flex flex-row items-center justify-start flex-wrap gap-2 sm:gap-3">
              <h4 className="not-italic text-gray-900 text-[22px] leading-[28px] font-medium">
                <div className="flex flex-row items-center justify-start flex-wrap gap-2">
                  <div className="gap-1 flex-row items-center justify-start flex-wrap flex sm:hidden">
                    {tokenData.logoUrl ? (
                      <Image
                        src={tokenData.logoUrl}
                        alt={tokenData.name}
                        width={20}
                        height={20}
                        className="rounded-full h-5 w-5 object-cover"
                      />
                    ) : (
                      <div 
                        className="rounded-full inline-block overflow-hidden"
                        style={{ backgroundColor: 'rgb(1, 132, 140)', height: '20px', width: '20px' }}
                      >
                        <img
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(minidenticon(address))}`}
                          alt=""
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                  Token
                </div>
              </h4>
            </div>
          </div>
          <div className="md:max-w-12/24 max-w-24/24 md:flex-12/24 flex-24/24 block relative box-border my-0 px-0 lg:flex lg:justify-end">
            <div className="w-full sm:max-w-[458px]">
              <SearchBar />
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 gap-y-2 sm:gap-y-4 items-end">
            <div className="max-w-24/24 lg:max-w-12/24 flex-24/24 lg:flex-12/24 block relative box-border my-0 px-1">
              <div className="flex gap-2 flex-row items-center justify-start flex-wrap w-full">
                <div className="gap-1 flex-row items-center justify-start flex-wrap hidden sm:flex flex-shrink-0">
                  {tokenData.logoUrl ? (
                    <Image
                      src={tokenData.logoUrl}
                      alt={tokenData.name}
                      width={20}
                      height={20}
                      className="rounded-full h-5 w-5 object-cover"
                    />
                  ) : (
                    <div 
                      className="rounded-full inline-block overflow-hidden"
                      style={{ backgroundColor: 'rgb(1, 132, 140)', height: '20px', width: '20px' }}
                    >
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(minidenticon(address))}`}
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="break-all font-normal text-gray-700 text-[14px] sm:text-[16px] align-middle">{address}</span>
                  <span className="inline-flex items-center gap-2 ml-2 align-middle">
                    <div className="inline-flex align-middle">
                      <Copy className="w-[18px] h-[18px] cursor-pointer text-[#adb5bd] hover:text-[#21f201]" onClick={handleCopyClick} />
                    </div>
                    <div className="inline-flex cursor-pointer" onClick={handleQrCodeClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:cursor-pointer text-[#adb5bd] hover:text-[#21f201]">
                        <rect width="5" height="5" x="3" y="3" rx="1"></rect>
                        <rect width="5" height="5" x="16" y="3" rx="1"></rect>
                        <rect width="5" height="5" x="3" y="16" rx="1"></rect>
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                        <path d="M21 21v.01"></path>
                        <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                        <path d="M3 12h.01"></path>
                        <path d="M12 3h.01"></path>
                        <path d="M12 16v.01"></path>
                        <path d="M16 12h1"></path>
                        <path d="M21 12v.01"></path>
                        <path d="M12 21v-1"></path>
                      </svg>
                    </div>
                    <div className="inline-flex">
                      <div 
                        className="px-2 py-1 flex items-center gap-1 rounded-full cursor-pointer"
                        style={{ background: 'linear-gradient(91.71deg, rgb(241, 52, 255) -21.92%, rgb(0, 212, 160) 100%)' }}
                      >
                        <DollarSign className="w-[18px] h-[18px] cursor-pointer text-white" />
                        <div className="not-italic text-[14px] leading-[24px] text-white font-bold">Tip</div>
                      </div>
                    </div>
                  </span>
                </div>
              </div>
            </div>
            <div className="max-w-24/24 lg:max-w-12/24 flex-24/24 lg:flex-12/24 relative box-border my-0 px-1 flex justify-start lg:justify-end">
              <div className="w-full lg:w-[458px]">
                <div className="flex flex-row items-center justify-between flex-wrap gap-1 sm:gap-3 w-full sm:w-auto">
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="text-inherit hidden sm:block">
                        <path d="M14.6667 14.1665C14.6667 14.4398 14.44 14.6665 14.1667 14.6665H1.83333C1.55999 14.6665 1.33333 14.4398 1.33333 14.1665C1.33333 13.8932 1.55999 13.6665 1.83333 13.6665H14.1667C14.44 13.6665 14.6667 13.8932 14.6667 14.1665Z" fill="currentColor"></path>
                        <path d="M10.26 3.01353L3.10001 10.1735C2.82668 10.4469 2.61331 10.6668 2.12001 10.1735H2.11335C1.18668 9.2402 0.333331 8.58686 2.11335 6.80687L6.88001 2.0402C8.58669 0.333508 9.32001 1.10687 10.2533 2.0402C10.6667 2.45352 10.5267 2.74687 10.26 3.01353Z" fill="currentColor"></path>
                        <path d="M13.88 5.66021L11.8467 3.62687C11.5733 3.35354 11.1333 3.35354 10.8667 3.62687L3.70666 10.7869C3.43333 11.0535 3.43333 11.4935 3.70666 11.7669L5.74 13.8069C6.67333 14.7335 8.18 14.7335 9.11333 13.8069L13.8733 9.04021C15 7.91354 15.3333 7.11354 13.88 5.66021ZM8.50666 11.6802L7.7 12.4935C7.53333 12.6602 7.26 12.6602 7.08666 12.4935C6.92 12.3269 6.92 12.0535 7.08666 11.8802L7.9 11.0669C8.06 10.9069 8.34 10.9069 8.50666 11.0669C8.67333 11.2335 8.67333 11.5202 8.50666 11.6802ZM11.1533 9.03354L9.52666 10.6669C9.36 10.8269 9.08666 10.8269 8.91333 10.6669C8.74666 10.5002 8.74666 10.2269 8.91333 10.0535L10.5467 8.42021C10.7067 8.26021 10.9867 8.26021 11.1533 8.42021C11.32 8.59354 11.32 8.86688 11.1533 9.03354Z" fill="currentColor"></path>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Buy</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" className="text-inherit hidden sm:block">
                        <path d="M6.33334 9.76699V11.567C6.33334 13.067 5.73334 13.667 4.23334 13.667H2.43334C0.933336 13.667 0.333336 13.067 0.333336 11.567V9.76699C0.333336 8.26699 0.933336 7.66699 2.43334 7.66699H4.23334C5.73334 7.66699 6.33334 8.26699 6.33334 9.76699Z" fill="currentColor"></path>
                        <path d="M10.6667 6.3335C12.3235 6.3335 13.6667 4.99035 13.6667 3.3335C13.6667 1.67664 12.3235 0.333496 10.6667 0.333496C9.00982 0.333496 7.66667 1.67664 7.66667 3.3335C7.66667 4.99035 9.00982 6.3335 10.6667 6.3335Z" fill="currentColor"></path>
                        <path d="M8.85332 13.6667C8.67332 13.6667 8.50665 13.5667 8.41999 13.4133C8.33332 13.2533 8.33332 13.0667 8.42665 12.9067L9.07332 11.8267C9.21332 11.5867 9.51999 11.5133 9.75999 11.6533C9.99999 11.7933 10.0733 12.1 9.93332 12.34L9.81332 12.54C11.46 12.1133 12.6733 10.62 12.6733 8.84668C12.6733 8.57335 12.9 8.34668 13.1733 8.34668C13.4467 8.34668 13.6667 8.57335 13.6667 8.85335C13.6667 11.5067 11.5067 13.6667 8.85332 13.6667Z" fill="currentColor"></path>
                        <path d="M0.833336 5.64683C0.560003 5.64683 0.333336 5.42683 0.333336 5.14683C0.333336 2.4935 2.49334 0.333496 5.14667 0.333496C5.33334 0.333496 5.49334 0.433496 5.58667 0.58683C5.67334 0.74683 5.67334 0.933496 5.58 1.0935L4.93334 2.16683C4.78667 2.40683 4.48 2.48683 4.24667 2.34016C4.00667 2.20016 3.93334 1.8935 4.07334 1.6535L4.19334 1.4535C2.55334 1.88016 1.33334 3.3735 1.33334 5.14683C1.33334 5.42683 1.10667 5.64683 0.833336 5.64683Z" fill="currentColor"></path>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Presale</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-inherit w-4 h-4 hidden sm:block">
                        <path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z"></path>
                        <path d="M12 17v4"></path>
                        <path d="M8 21h8"></path>
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Play</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                  <button type="button" className="flex-1 sm:flex-none">
                    <div className="flex justify-center items-center font-medium transition-colors flex-nowrap bg-white h-[32px] text-[12px] leading-[25px] gap-1 px-1.5 sm:px-[10px] py-[6px] w-full sm:w-auto border border-gray-200 rounded-lg hover:text-white hover:bg-[#21f201]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" className="text-inherit hidden sm:block">
                        <path d="M15.8333 10.4208C15.799 8.50726 15.5729 6.57224 15.2023 4.61916C14.9003 3.26221 13.8141 2.05364 12.0784 1.96513C10.7971 1.91242 10.5493 2.64231 9.09755 2.62828C8.69994 2.6257 8.30263 2.6257 7.90502 2.62828C6.45297 2.64231 6.20461 1.91242 4.92385 1.96513C3.18791 2.05364 2.06786 3.25906 1.79888 4.61916C1.42791 6.57224 1.2019 8.50697 1.16781 10.4205C1.1595 11.7528 2.47492 12.6391 3.34289 12.6999C5.01953 12.8265 6.35156 9.86994 7.36648 9.86966C8.12302 9.87395 8.87927 9.87424 9.6358 9.86966C10.651 9.86966 11.9819 12.8268 13.6597 12.7002C14.5274 12.6394 15.8769 11.7471 15.8336 10.4208H15.8333ZM6.6363 6.68711H5.85427V7.46914C5.85427 7.79914 5.58672 8.06669 5.25672 8.06669C4.92672 8.06669 4.65916 7.79914 4.65916 7.46914V6.68711H3.87713C3.54713 6.68711 3.27958 6.41955 3.27958 6.08955C3.27958 5.75955 3.54713 5.492 3.87713 5.492H4.65916V4.70997C4.65916 4.37997 4.92672 4.11242 5.25672 4.11242C5.58672 4.11242 5.85427 4.37997 5.85427 4.70997V5.492H6.6363C6.9663 5.492 7.23385 5.75955 7.23385 6.08955C7.23385 6.41955 6.9663 6.68711 6.6363 6.68711ZM11.4651 8.0664C10.9973 8.07901 10.6083 7.70948 10.5957 7.24197C10.5834 6.77276 10.9532 6.38317 11.4207 6.37114C11.8888 6.3594 12.2784 6.72864 12.2904 7.19671C12.3022 7.66479 11.9329 8.05437 11.4651 8.0664ZM12.8759 5.80768C12.4081 5.82086 12.0183 5.45104 12.0054 4.98325C11.9936 4.51461 12.3629 4.1256 12.831 4.1127C13.2996 4.10039 13.6886 4.4702 13.7012 4.93828C13.7135 5.40606 13.3434 5.79593 12.8759 5.80768Z" fill="currentColor"></path>
                      </svg>
                      <div className="not-italic text-[14px] leading-[20px] font-medium text-inherit">Gaming</div>
                      <ChevronDown className="w-4 h-4 text-inherit" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Utility Icons Row */}
        <div className="w-full flex items-center justify-end gap-2">
          <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]">
            <Star className="w-4 h-4" />
          </button>
          <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px] gap-1">
            <CodeXml className="w-4 h-4" />
            <span className="text-xs">API</span>
          </button>
          <button className="text-gray-500 hover:text-gray-600 cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1.5 flex items-center justify-center text-sm h-[30px]">
            <List className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Main Cards Section */}
      <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border gap-y-4 -mx-1.5 items-stretch mb-4">
        {/* Overview Card */}
        <div className="max-w-24/24 md:max-w-12/24 lg:max-w-8/24 flex-24/24 md:flex-12/24 lg:flex-8/24 block relative box-border my-0 px-1.5">
          <div className="rounded-xl border border-gray-200 shadow-md bg-white p-4 lg h-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full mb-4">
              <div className="not-italic text-[15px] leading-[24px] font-medium text-gray-700">Overview</div>
            </div>
            <div className="flex flex-col gap-4 items-start justify-start">
              {/* Total Supply */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Total Supply</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">{formatNumber(Number(tokenData.totalSupply || 0), 0)}</div>
                  </div>
                </div>
              </div>
              
              {/* Holders */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Holders</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">{tokenData.holdersCount || 0}</div>
                  </div>
                </div>
              </div>
              
              {/* Transfers */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Transfers</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">{tokenData.transfersCount || totalCount || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More info Card */}
        <div className="max-w-24/24 md:max-w-12/24 lg:max-w-8/24 flex-24/24 md:flex-12/24 lg:flex-8/24 block relative box-border my-0 px-1.5">
          <div className="rounded-xl border border-gray-200 shadow-md bg-white p-4 lg h-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full mb-4">
              <div className="not-italic text-[15px] leading-[24px] font-medium text-gray-700">More info</div>
            </div>
            <div className="flex flex-col gap-4 items-start justify-start">
              {/* Contract */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Contract</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <span className="w-auto max-w-full inline-flex items-center whitespace-nowrap">
                    <span className="align-middle font-normal text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all px-[3px] -mx-1 rounded-md text-blue-600">
                      <Link href={`/address/${address}`} className="text-current">{shortenAddress(address)}</Link>
                    </span>
                    <span className="inline-flex items-center ml-1 gap-2 align-middle">
                      <div className="inline-flex align-middle">
                        <Copy className="w-3 h-3 cursor-pointer text-[#adb5bd] hover:text-[#21f201]" onClick={handleCopyClick} />
                      </div>
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Decimals */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Decimals</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">18</div>
                  </div>
                </div>
              </div>
              
              {/* Symbol */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border -mx-1 w-full gap-y-0">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Symbol</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <div className="flex gap-1 flex-row items-center justify-start flex-wrap">
                    <div className="not-italic text-gray-700 text-[14px] leading-[24px] font-bold">{tokenData.symbol || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Misc Card */}
        <div className="max-w-24/24 md:max-w-24/24 lg:max-w-8/24 flex-24/24 md:flex-24/24 lg:flex-8/24 block relative box-border my-0 px-1.5">
          <div className="rounded-xl border border-gray-200 shadow-md bg-white p-4 lg h-full">
            <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full mb-4">
              <div className="not-italic text-[15px] leading-[24px] font-medium text-gray-700">Misc</div>
            </div>
            <div className="flex flex-col gap-4 items-start justify-start">
              {/* Personal label */}
              <div className="flex flex-row flex-wrap justify-start grow-0 shrink-0 basis-full min-w-0 box-border gap-y-4 -mx-1 w-full">
                <div className="max-w-24/24 md:max-w-8/24 flex-24/24 md:flex-8/24 block relative box-border my-0 px-1">
                  <div className="not-italic font-normal text-[14px] leading-[24px] text-gray-500">Personal label</div>
                </div>
                <div className="max-w-24/24 md:max-w-16/24 flex-24/24 md:flex-16/24 block relative box-border my-0 px-1">
                  <Link href="/user/signin">
                    <div className="flex gap-1 flex-row items-center justify-start flex-wrap cursor-pointer text-blue-600 w-fit">
                      <Tag className="w-4 h-4" />
                      <div className="not-italic font-normal text-gray-700 text-[14px] leading-[24px] text-blue-600">Sign in to add personal label</div>
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Ad Section */}
              <div className="w-full overflow-x-auto overflow-y-hidden inline-flex pt-2 justify-start">
                <div className="relative inline-block">
                  <span className="absolute bg-white text-gray-900 shadow-md rounded-md text-xs px-1 right-5 -top-2">Ad</span>
                  <Image
                    src="/images/ads.png"
                    alt="sponsor"
                    width={300}
                    height={100}
                    className="rounded-md h-auto w-auto cursor-pointer"
                    onClick={() => window.open("https://quickido.com", "_blank")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tab-wrapper relative overflow-x-scroll no-scrollbar flex items-start sm:items-center sm:justify-between gap-2 flex-col sm:flex-row mb-3 w-full">
        <div dir="ltr" className="w-auto whitespace-nowrap" style={{ position: "relative", "--radix-scroll-area-corner-width": "0px", "--radix-scroll-area-corner-height": "0px" } as React.CSSProperties}>
          <div 
            role="tablist" 
            aria-orientation="horizontal" 
            className="items-center justify-start rounded-md text-gray-500 h-auto inline-flex bg-transparent p-0 w-full"
            tabIndex={0}
            data-orientation="horizontal"
            style={{ outline: "none" }}
          >
            {["Transactions", "Holders"].map((tab) => {
              const tabKey = tab.toLowerCase();
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`radix-tab-content-${tabKey}`}
                  data-state={isActive ? "active" : "inactive"}
                  id={`radix-tab-trigger-${tabKey}`}
                  onClick={() => setActiveTab(tabKey as TabType)}
                  className={`py-1.5 font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent relative inline-flex items-center justify-center whitespace-nowrap bg-gray-100 hover:bg-gray-200 border-0 rounded-lg text-xs text-gray-700 data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:!bg-[#009978] data-[state=active]:hover:!bg-[#008066] ml-2 first:ml-0 transition-colors duration-200 px-3 h-7 w-full`}
                  tabIndex={-1}
                  data-orientation="horizontal"
                  data-radix-collection-item=""
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2 flex-row items-center justify-end flex-nowrap">
              {/* Desktop Filters */}
              <div className="lg:flex gap-2 hidden">
                {/* Hide Spam Txs */}
                <div className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50">
                  <Info className="w-3.5 h-3.5 text-gray-700" />
                  Hide Spam Txs
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hideSpam}
                    data-state={hideSpam ? "checked" : "unchecked"}
                    value="on"
                    onClick={() => setHideSpam(!hideSpam)}
                    className="peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#21f201] data-[state=checked]:hover:bg-[#1bd301] data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300"
                  >
                    <span
                      data-state={hideSpam ? "checked" : "unchecked"}
                      className="pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
                    />
                  </button>
                </div>
                
                {/* Hide Failed */}
                <div className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50">
                  <Info className="w-3.5 h-3.5 text-gray-700" />
                  Hide Failed
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hideFailed}
                    data-state={hideFailed ? "checked" : "unchecked"}
                    value="on"
                    onClick={() => setHideFailed(!hideFailed)}
                    className="peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#21f201] data-[state=checked]:hover:bg-[#1bd301] data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300"
                  >
                    <span
                      data-state={hideFailed ? "checked" : "unchecked"}
                      className="pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
                    />
                  </button>
                </div>
                
                {/* Oldest First */}
                <div className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50">
                  <Info className="w-3.5 h-3.5 text-gray-700" />
                  Oldest First
                  <button
                    type="button"
                    role="switch"
                    aria-checked={oldestFirst}
                    data-state={oldestFirst ? "checked" : "unchecked"}
                    value="on"
                    onClick={() => setOldestFirst(!oldestFirst)}
                    className="peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#21f201] data-[state=checked]:hover:bg-[#1bd301] data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300"
                  >
                    <span
                      data-state={oldestFirst ? "checked" : "unchecked"}
                      className="pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
                    />
                  </button>
                </div>
              </div>
              
              {/* Mobile Filter Button */}
              <div className="gap-2 flex-row items-center justify-end flex-wrap lg:hidden flex">
                <button
                  type="button"
                  className="cursor-pointer py-1 h-[28px] inline-flex items-center gap-1 justify-center border border-gray-200 whitespace-nowrap rounded-lg px-2.5 text-[12px] font-medium transition-all text-gray-700 bg-gray-50"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 cursor-pointer text-inherit" />
                </button>
              </div>
              
              {/* Right Side Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setTempColumnVisibility(columnVisibility);
                    setTempColumnOrder(columnOrder);
                    setShowColumnMenu(!showColumnMenu);
                  }}
                  className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold h-auto transition-colors border border-gray-200 hover:bg-gray-100 text-gray-700 ring-transparent ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-transparent py-1.5 text-[12px] leading-[18px] gap-0.5 px-1.5 h-[28px] bg-gray-50"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Column Customization Dropdown */}
                {showColumnMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowColumnMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-[280px]">
                      {/* Column List */}
                      <div className="p-4 max-h-[400px] overflow-y-auto">
                        {tempColumnOrder.map((columnKey: string, index: number) => {
                          const columnMap: Record<string, string> = {
                            preview: "Preview",
                            signature: "Transaction Hash",
                            block: "Block",
                            time: "Time",
                            action: "Action",
                            instructions: "Instructions",
                            by: "By",
                            value: "Value",
                            fee: "Fee (DFS)",
                          };
                          const column = { key: columnKey, label: columnMap[columnKey] };
                          const isDragging = draggedIndex === index;
                          const isDragOver = dragOverIndex === index;

                          return (
                            <div
                              key={column.key}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              onDrop={(e) => handleDrop(e, index)}
                              className={`flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded cursor-move transition-colors ${
                                isDragging ? "opacity-50" : ""
                              } ${isDragOver ? "bg-blue-50 border-t-2 border-blue-500" : ""}`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="checkbox"
                                  checked={tempColumnVisibility[column.key as keyof typeof tempColumnVisibility]}
                                  onChange={(e) =>
                                    setTempColumnVisibility({
                                      ...tempColumnVisibility,
                                      [column.key]: e.target.checked,
                                    })
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-[#21f201] border-gray-300 rounded focus:ring-[#21f201] cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">{column.label}</span>
                              </div>
                              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                            </div>
                          );
                        })}
                      </div>

                      {/* Separator */}
                      <div className="border-t border-gray-200" />

                      {/* Action Buttons */}
                      <div className="p-4 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={handleResetColumns}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyColumns}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#21f201] hover:bg-[#1bd301] rounded-lg transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <TokenTransactions
              transactions={transactions}
              address={address}
              totalCount={totalCount}
              hideHeader={true}
              isSolanaScan={true}
              columnOrder={columnOrder}
              columnVisibility={columnVisibility}
            />
          </div>
        </div>
      )}

      {/* Holders Table */}
      {activeTab === "holders" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <TokenHolders
            holders={holders}
            totalSupply={tokenData.totalSupply}
            tokenAddress={address}
          />
        </div>
      )}

      {qrCodeModalOpen && (
        <QRCodeModal
          address={address}
          onClose={() => setQrCodeModalOpen(false)}
        />
      )}
    </div>
  );
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
