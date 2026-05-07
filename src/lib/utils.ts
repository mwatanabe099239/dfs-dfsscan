import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Transaction } from "@/src/types";

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) {
    return `${seconds} secs ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

// Helper function for consistent number formatting
export function formatNumber(num: number, decimalPlaces: number = 4): string {
  // Split the number into whole and decimal parts
  const [whole, decimal] = num.toString().split(".");

  // Add commas only to the whole number part
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // If there's a decimal part, add it back
  return decimal
    ? `${formattedWhole}.${decimal.slice(0, decimalPlaces)}`
    : formattedWhole;
}

export const shortenAddress = (
  address: string,
  from: number = 15,
  to: number = 7
) => {
  if (!address) return "";
  return `${address.slice(0, from)}...${address.slice(-to)}`;
};

export const shortenHash = (hash: string, to: number = 12) => {
  return `${hash.slice(0, to)}...`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects whether a transaction row represents the NFT-custody leg of an
 * NFT-related event (mint/listing/delisting/purchase transfer).
 *
 * We deliberately avoid relying on a single literal method string because
 * older docs / case drift (`"NFT Transfer"` vs `"nft transfer"` vs
 * `"NFT_TRANSFER"`) can leak through. The fallback signal is the presence of
 * NFT metadata (`tx.nft?.tokenId` or top-level `tx.tokenId`) on a row that is
 * NOT the native DFS-token leg. The DFS-payment leg of a purchase carries
 * `token.tokenAddress === "drc20_dfs"`, so it is excluded.
 */
export function isNftTransferTx(
  tx: Pick<Transaction, "method" | "nft" | "tokenId" | "token">,
): boolean {
  const m = (tx.method || "").trim().toLowerCase().replace(/[_-]+/g, " ");
  // Any explicit "NFT …" method (Transfer, Listing, Delisting, Mint, …) is
  // an NFT-custody row — the Value column should render the NFT, not DFS.
  if (m.startsWith("nft ")) return true;

  const hasNftId = Boolean(
    (tx.nft?.tokenId && String(tx.nft.tokenId)) ||
      (tx.tokenId && String(tx.tokenId)),
  );
  if (!hasNftId) return false;

  const tokenAddress = (tx.token?.tokenAddress || "").toLowerCase();
  const tokenSymbol = (tx.token?.symbol || "").toLowerCase();
  const isNativeDfsLeg = tokenAddress === "drc20_dfs" || tokenSymbol === "dfs";
  return !isNativeDfsLeg;
}

/**
 * Renders the "value" column for a transaction row.
 *  - DFS / token transfers   → "0.123456 DFS"
 *  - NFT Transfer            → "#<tokenId> <SYMBOL>"   (no DFS suffix)
 *
 * For NFT Transfer rows, the on-chain token id may live in `tx.nft.tokenId`,
 * the top-level `tx.tokenId`, or — for purchases mirrored by the marketplace —
 * in `tx.amount`. The function picks the first non-empty source.
 */
export function formatTxValue(
  tx: Pick<
    Transaction,
    "amount" | "method" | "token" | "nft" | "tokenId"
  >,
  decimalPlaces: number = 6,
): string {
  if (isNftTransferTx(tx)) {
    const tokenId =
      (tx.nft?.tokenId && String(tx.nft.tokenId)) ||
      (tx.tokenId && String(tx.tokenId)) ||
      (tx.amount && String(tx.amount)) ||
      "";
    const symbol = tx.nft?.symbol || tx.nft?.name || "NFT";
    return tokenId ? `#${tokenId} ${symbol}` : symbol;
  }
  const sym =
    tx.method === "Token Created" ? "DFS" : tx.token?.symbol || "DFS";
  return `${formatNumber(Number(tx.amount), decimalPlaces)} ${sym}`;
}

export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(1) + " B";
  }

  if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + " M";
  }

  if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + " K";
  }

  return value.toString();
}
