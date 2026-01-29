"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getTokensWithWeb3Address } from "@/src/lib/firebase";
import { formatNumber, formatCompactNumber } from "@/src/lib/utils";

// Format price with 4-6 decimals as necessary
const formatPrice = (price: number): string => {
  if (price === 0) return "0";
  if (price >= 1) {
    return formatNumber(price, 4);
  } else if (price >= 0.01) {
    return formatNumber(price, 5);
  } else {
    return formatNumber(price, 6);
  }
};

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  web3TokenAddress: string;
  tokenAddress: string;
}

interface TokenPriceData {
  price: number;
  priceChange24h: number;
  marketCap: number;
}

export default function TokenDashboard() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenPriceData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const tokensData = await getTokensWithWeb3Address(10);
        setTokens(tokensData as TokenData[]);

        // Fetch price data for each token
        const pricePromises = tokensData.map(async (token: any) => {
          if (!token.web3TokenAddress) return null;
          
          try {
            const response = await fetch(`/api/dextool-token-price?address=${token.web3TokenAddress}`);
            if (response.ok) {
              const priceData = await response.json();
              // DexTool API response structure matches DFS price structure: { data: { priceUsd, priceChange: { h24 }, marketCap } }
              const data = priceData.data;
              
              // Calculate market cap if not provided: marketCap = price × circulatingSupply
              let marketCap = data?.marketCap || 0;
              if (!marketCap && data?.priceUsd && data?.circulatingSupply) {
                marketCap = data.priceUsd * data.circulatingSupply;
              }
              
              // Fallback: try to get market cap from token's totalSupply in Firebase
              if (!marketCap && data?.priceUsd && token.totalSupply) {
                marketCap = data.priceUsd * parseFloat(token.totalSupply);
              }
              
              return {
                address: token.web3TokenAddress,
                price: data?.priceUsd || 0,
                priceChange24h: data?.priceChange?.h24 || 0,
                marketCap: marketCap,
              };
            }
          } catch (error) {
            console.error(`Error fetching price for ${token.web3TokenAddress}:`, error);
          }
          return null;
        });

        const prices = await Promise.all(pricePromises);
        const priceMap: Record<string, TokenPriceData> = {};
        prices.forEach((price) => {
          if (price) {
            priceMap[price.address] = {
              price: price.price,
              priceChange24h: price.priceChange24h,
              marketCap: price.marketCap,
            };
          }
        });
        setTokenPrices(priceMap);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden w-1/2">
      <div className="flex flex-col gap-4 items-start justify-between h-full">
        {/* Header */}
        <div className="flex gap-1 flex-row items-center justify-between flex-wrap w-full px-4 pt-4">
          <div className="text-[15px] leading-[24px] font-medium text-gray-900">
            Token Dashboard
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-0 items-stretch justify-start w-full h-full">
          <div className="h-full w-auto sm:w-full">
            <div className="relative overflow-hidden">
              <div className="h-full w-full rounded-[inherit] overflow-x-auto">
                <div style={{ minWidth: "100%", display: "table" }}>
                  <table className="w-full border-separate caption-bottom border-spacing-0">
                    <thead className="sticky top-0 z-10">
                      <tr className="transition-colors bg-white border-b border-gray-200">
                        <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                          Token
                        </th>
                        <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                          Symbol
                        </th>
                        <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                          Price
                        </th>
                        <th className="h-12 px-2 py-[10px] text-left align-middle font-bold text-[14px] leading-[24px] text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4" style={{ minWidth: "160px" }}>
                          Market Cap (F.D)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child_td]:border-b-0">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="h-12 px-2 py-[10px] text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : tokens.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="h-12 px-2 py-[10px] text-center text-gray-500">
                            No tokens found
                          </td>
                        </tr>
                      ) : (
                        tokens.map((token) => {
                          const priceData = tokenPrices[token.web3TokenAddress];
                          const priceChange = priceData?.priceChange24h || 0;
                          const isPositive = priceChange >= 0;

                          return (
                            <tr
                              key={token.id}
                              className="transition-colors hover:bg-gray-50 bg-white border-b border-gray-200"
                            >
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                <span className="whitespace-nowrap inline-flex items-center max-w-full min-w-0">
                                  {token.logoUrl && (
                                    <span className="inline-flex align-middle mr-1">
                                      <div className="inline-flex items-center">
                                        <div className="flex align-middle" style={{ minWidth: "16px", maxWidth: "16px", height: "16px", position: "relative" }}>
                                          <Image
                                            src={token.logoUrl}
                                            alt={token.name}
                                            width={16}
                                            height={16}
                                            className="rounded-[5px] object-cover"
                                            style={{ position: "absolute", height: "100%", objectFit: "cover", left: 0 }}
                                          />
                                        </div>
                                      </div>
                                    </span>
                                  )}
                                  <span className="align-middle font-normal text-gray-900 text-[14px] leading-[20px] border border-dashed border-transparent box-content break-all truncate px-[3px] -mx-1 rounded-sm text-[#2563eb]">
                                    <div className="inline">
                                      <Link href={`/address/${token.tokenAddress}`} className="text-current hover:underline">
                                        {token.name}
                                      </Link>
                                    </div>
                                  </span>
                                </span>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                <div className="font-normal text-gray-900 text-[14px] leading-[24px]">
                                  {token.symbol}
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                <div className="flex gap-1 flex-row items-center justify-start flex-nowrap">
                                  <div className="font-normal text-gray-900 text-[14px] leading-[24px]">
                                    ${priceData ? formatPrice(priceData.price) : "0"}
                                  </div>
                                  {priceData && priceChange !== 0 && (
                                    <div className="text-gray-900 text-[16px] leading-[24px] font-bold">
                                      <div className="flex flex-row items-center justify-start flex-nowrap gap-0.5">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="14"
                                          height="14"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className={`lucide lucide-arrow-up ${isPositive ? "text-green-500" : "text-red-500"} ${!isPositive ? "rotate-180" : ""}`}
                                          aria-hidden="true"
                                        >
                                          <path d="m5 12 7-7 7 7"></path>
                                          <path d="M12 19V5"></path>
                                        </svg>
                                        <div className={`text-[14px] leading-[24px] font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                          {isPositive ? "+" : ""}{formatNumber(Math.abs(priceChange), 5)}%
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="h-12 px-2 py-[10px] align-middle text-[14px] leading-[24px] font-normal text-gray-900 border-b border-gray-200 first:pl-4 last:pr-4">
                                <div className="font-normal text-gray-900 text-[14px] leading-[24px]">
                                  ${priceData && priceData.marketCap > 0 ? formatCompactNumber(priceData.marketCap) : "0"}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-4 border-t border-gray-200 bg-gray-50 w-full">
          <Link href="/leaderboard/token" className="w-full">
            <div className="flex gap-1 flex-row items-center justify-center flex-wrap hover:text-[#2563eb] text-gray-500">
              <div className="text-[12px] leading-[16px] text-inherit font-medium transition-colors uppercase">
                Visit Token Dashboard
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-inherit transition-colors"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

