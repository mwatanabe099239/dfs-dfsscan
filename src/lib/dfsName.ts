import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { isUserWalletAddress, normalizeAddress } from "@/src/lib/address";
import { shortenAddress } from "@/src/lib/utils";

const LABEL_PATTERN =
  /^(?:[\p{Script=Latin}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}0-9]|-)+$/u;

function isValidNameLabel(label: string): boolean {
  if (!label || label.length < 1 || label.length > 32) return false;
  if (label.startsWith("-") || label.endsWith("-") || label.includes("--")) {
    return false;
  }
  return LABEL_PATTERN.test(label);
}

export function isDfsNameQuery(value: string): boolean {
  const v = value.trim().normalize("NFKC").toLowerCase();
  if (!v.endsWith(".dfs")) return false;
  return isValidNameLabel(v.slice(0, -4));
}

export function normalizeDfsName(value: string): string | null {
  const v = value.trim().normalize("NFKC").toLowerCase();
  const withSuffix = v.endsWith(".dfs") ? v : `${v}.dfs`;
  if (!isDfsNameQuery(withSuffix)) return null;
  return withSuffix;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export type WalletBadge = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
};

export type WalletDisplayMeta = {
  name: string | null;
  /** The connected .dfs name carries the badge, not the wallet itself. */
  verified: boolean;
  /** Badge awarded by an admin, when the name has one. */
  badge: WalletBadge | null;
};

/** Reverse-resolve wallet addresses → .dfs name + verification badge. */
export async function resolveWalletMeta(
  addresses: string[]
): Promise<Record<string, WalletDisplayMeta>> {
  const unique = [
    ...new Set(
      addresses
        .map((a) => normalizeAddress(a))
        .filter((a) => a && isUserWalletAddress(a))
    ),
  ];
  const result: Record<string, WalletDisplayMeta> = {};
  unique.forEach((a) => {
    result[a] = { name: null, verified: false, badge: null };
  });
  if (unique.length === 0) return result;

  for (const group of chunk(unique, 10)) {
    try {
      const usersSnap = await getDocs(
        query(collection(db, "users"), where("walletAddress", "in", group))
      );
      usersSnap.forEach((d) => {
        const data = d.data();
        const wallet = normalizeAddress(data.walletAddress || "");
        if (!wallet || !result[wallet]) return;
        if (data.dfsName) {
          result[wallet].name = String(data.dfsName).toLowerCase();
        }
      });
    } catch (err) {
      console.error("resolveWalletMeta users query failed", err);
    }

    try {
      const namesSnap = await getDocs(
        query(collection(db, "names"), where("connectedWallet", "in", group))
      );
      namesSnap.forEach((d) => {
        const data = d.data();
        const wallet = normalizeAddress(data.connectedWallet || "");
        if (!wallet || !result[wallet] || !data.name) return;
        if (!result[wallet].name) {
          result[wallet].name = String(data.name).toLowerCase();
        }
        if (result[wallet].name === String(data.name).toLowerCase()) {
          result[wallet].verified = !!data.verified;
          result[wallet].badge = data.badgeId
            ? {
                id: String(data.badgeId),
                title: String(data.badgeTitle || ""),
                description: String(data.badgeDescription || ""),
                imageUrl: String(data.badgeImageUrl || ""),
                color: String(data.badgeColor || "#0ea5e9"),
              }
            : null;
        }
      });
    } catch (err) {
      console.error("resolveWalletMeta names query failed", err);
    }
  }

  return result;
}

/** Reverse-resolve wallet addresses → primary .dfs name (if connected). */
export async function resolveDfsNames(
  addresses: string[]
): Promise<Record<string, string | null>> {
  const meta = await resolveWalletMeta(addresses);
  const result: Record<string, string | null> = {};
  Object.entries(meta).forEach(([wallet, value]) => {
    result[wallet] = value.name;
  });
  return result;
}

/** Forward-resolve name.dfs → connected or owner wallet. */
export async function resolveWalletByDfsName(
  nameInput: string
): Promise<string | null> {
  const name = normalizeDfsName(nameInput);
  if (!name) return null;
  const docId = name.replace(/\.dfs$/, "");
  try {
    const snap = await getDoc(doc(db, "names", docId));
    if (!snap.exists()) return null;
    const data = snap.data();
    const wallet = data.connectedWallet || data.ownerWallet;
    return wallet ? normalizeAddress(wallet) : null;
  } catch (err) {
    console.error("resolveWalletByDfsName failed", err);
    return null;
  }
}

export function formatWalletLabel(
  address: string,
  nameMap?: Record<string, string | null>,
  start = 15,
  end = 7
): string {
  if (!address) return "";
  const key = normalizeAddress(address);
  const name = nameMap?.[key];
  if (name) return name;
  return shortenAddress(address, start, end);
}
