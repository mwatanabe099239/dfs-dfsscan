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

const NAME_LABEL_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export function isDfsNameQuery(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v.endsWith(".dfs")) return false;
  const label = v.slice(0, -4);
  return NAME_LABEL_REGEX.test(label);
}

export function normalizeDfsName(value: string): string | null {
  const v = value.trim().toLowerCase();
  const withSuffix = v.endsWith(".dfs") ? v : `${v}.dfs`;
  if (!isDfsNameQuery(withSuffix)) return null;
  return withSuffix;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Reverse-resolve wallet addresses → primary .dfs name (if connected). */
export async function resolveDfsNames(
  addresses: string[]
): Promise<Record<string, string | null>> {
  const unique = [
    ...new Set(
      addresses
        .map((a) => normalizeAddress(a))
        .filter((a) => a && isUserWalletAddress(a))
    ),
  ];
  const result: Record<string, string | null> = {};
  unique.forEach((a) => {
    result[a] = null;
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
        if (wallet && data.dfsName) {
          result[wallet] = String(data.dfsName).toLowerCase();
        }
      });
    } catch (err) {
      console.error("resolveDfsNames users query failed", err);
    }

    try {
      const namesSnap = await getDocs(
        query(collection(db, "names"), where("connectedWallet", "in", group))
      );
      namesSnap.forEach((d) => {
        const data = d.data();
        const wallet = normalizeAddress(data.connectedWallet || "");
        if (wallet && data.name && !result[wallet]) {
          result[wallet] = String(data.name).toLowerCase();
        }
      });
    } catch (err) {
      console.error("resolveDfsNames names query failed", err);
    }
  }

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
