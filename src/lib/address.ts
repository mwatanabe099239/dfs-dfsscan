import { NON_USER_ADDRESS } from "./constant";
import type { Transaction } from "../types";

export const USER_WALLET_PREFIX = "dfs_0x";
export const CONTRACT_WALLET_PREFIX = "dfs_contract_0x";
export const TOKEN_PREFIX = "drc20_0x";

/** User wallet: `dfs_0x` + 40 hex */
export const USER_WALLET_LENGTH = 46;
/** Burn-to-earn contract wallet: `dfs_contract_0x` + 40 hex */
export const CONTRACT_WALLET_LENGTH = 55;
/** DRC20 token: `drc20_0x` + 40 hex */
export const TOKEN_ADDRESS_LENGTH = 48;
/** Transaction hash: `dfs_0x` + 64 hex */
export const TX_HASH_LENGTH = 70;

export type AddressKind = "wallet" | "contract" | "token" | "invalid";

export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

export function isWhitelistedNonUser(address: string): boolean {
  const trimmed = address.trim();
  const lower = trimmed.toLowerCase();
  return (
    NON_USER_ADDRESS.includes(trimmed) || NON_USER_ADDRESS.includes(lower)
  );
}

export function isUserWalletAddress(address: string): boolean {
  const lower = normalizeAddress(address);
  return lower.startsWith(USER_WALLET_PREFIX) && lower.length === USER_WALLET_LENGTH;
}

export function isContractAddress(address: string): boolean {
  const lower = normalizeAddress(address);
  return (
    lower.startsWith(CONTRACT_WALLET_PREFIX) &&
    lower.length === CONTRACT_WALLET_LENGTH
  );
}

export function isTokenAddress(address: string): boolean {
  const lower = normalizeAddress(address);
  return lower.startsWith(TOKEN_PREFIX) && lower.length === TOKEN_ADDRESS_LENGTH;
}

export function isTransactionHash(address: string): boolean {
  const trimmed = address.trim();
  return trimmed.startsWith("dfs_0x") && trimmed.length === TX_HASH_LENGTH;
}

/** Any address page target: user wallet, contract wallet, or whitelisted pool. */
export function isWalletLikeAddress(address: string): boolean {
  return (
    isUserWalletAddress(address) ||
    isContractAddress(address) ||
    isWhitelistedNonUser(address)
  );
}

export function getAddressKind(address: string): AddressKind {
  if (isContractAddress(address)) return "contract";
  if (isUserWalletAddress(address) || isWhitelistedNonUser(address)) {
    return "wallet";
  }
  if (isTokenAddress(address)) return "token";
  return "invalid";
}

/** True when balances should be read from the `non_users` collection first. */
export function resolvesFromNonUsers(address: string): boolean {
  return isContractAddress(address) || isWhitelistedNonUser(address);
}

/** Hide legacy burn rows that incorrectly show user -> contract on contract pages. */
export function filterTransactionsForAddressView(
  transactions: Transaction[],
  address: string,
  kind: AddressKind
) {
  if (kind !== "contract") return transactions;

  const normalized = normalizeAddress(address);
  return transactions.filter((tx) => {
    if (tx.method !== "Burn to Earn") return true;

    const from = normalizeAddress(tx.fromAddress || "");
    const to = normalizeAddress(tx.toAddress || "");

    // Burnt tokens go to the zero address, not the pool contract.
    return !(to === normalized && from !== normalized);
  });
}
