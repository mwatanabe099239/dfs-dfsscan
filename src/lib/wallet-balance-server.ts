import type { Firestore } from "firebase-admin/firestore";
import {
  isContractAddress,
  isWhitelistedNonUser,
  normalizeAddress,
} from "@/src/lib/address";

function resolvesFromNonUsers(address: string): boolean {
  return isContractAddress(address) || isWhitelistedNonUser(address);
}

async function queryWalletByAddressAdmin(
  db: Firestore,
  collectionName: "users" | "non_users",
  walletAddress: string
): Promise<Record<string, unknown> | null> {
  const variants = Array.from(
    new Set([walletAddress.trim(), walletAddress.trim().toLowerCase()])
  ).filter(Boolean);

  for (const w of variants) {
    const snap = await db
      .collection(collectionName)
      .where("walletAddress", "==", w)
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0].data() as Record<string, unknown>;
  }

  for (const w of variants) {
    const direct = await db.collection(collectionName).doc(w).get();
    if (direct.exists) return direct.data() as Record<string, unknown>;
  }

  return null;
}

function consolidateTokens(tokens: Record<string, unknown>[]) {
  const map = new Map<string, Record<string, unknown>>();

  for (const token of tokens) {
    const addr = String(token.tokenAddress || "").toLowerCase();
    if (!addr) continue;

    const existing = map.get(addr);
    if (!existing) {
      map.set(addr, { ...token, tokenAddress: addr });
      continue;
    }

    map.set(addr, {
      ...existing,
      ...token,
      tokenAddress: addr,
      balance: Number(existing.balance ?? 0) + Number(token.balance ?? 0),
      locked: Number(existing.locked ?? 0) + Number(token.locked ?? 0),
    });
  }

  return Array.from(map.values());
}

export type WalletBalancePayload = {
  nativeTokenBalance: string;
  tokens: Record<string, unknown>[];
  isContract?: boolean;
};

export async function getWalletBalanceForAddress(
  db: Firestore,
  address: string
): Promise<WalletBalancePayload | null> {
  const walletAddress = normalizeAddress(address);

  let walletData: Record<string, unknown> | null = null;

  if (resolvesFromNonUsers(walletAddress)) {
    walletData = await queryWalletByAddressAdmin(
      db,
      "non_users",
      walletAddress
    );
  } else {
    walletData = await queryWalletByAddressAdmin(db, "users", walletAddress);
    if (!walletData) {
      walletData = await queryWalletByAddressAdmin(
        db,
        "non_users",
        walletAddress
      );
    }
  }

  if (!walletData) return null;

  const rawTokens = Array.isArray(walletData.tokens) ? walletData.tokens : [];

  return {
    nativeTokenBalance: String(walletData.nativeTokenBalance ?? "0"),
    tokens: consolidateTokens(rawTokens as Record<string, unknown>[]),
    isContract: Boolean(walletData.isContract),
  };
}
