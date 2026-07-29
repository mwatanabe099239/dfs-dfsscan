import {
  isTokenAddress,
  isTransactionHash,
  isWalletLikeAddress,
} from "@/src/lib/address";
import { findTokenAddressByQuery } from "@/src/lib/firebase";
import {
  isDfsNameQuery,
  resolveWalletByDfsName,
} from "@/src/lib/dfsName";

export type SearchNavigation =
  | { type: "address"; href: string }
  | { type: "tx"; href: string }
  | { type: "none" };

/**
 * Classify a search query and resolve symbol/name lookups to a token address page.
 */
export async function resolveSearchNavigation(
  rawQuery: string
): Promise<SearchNavigation> {
  const query = rawQuery.trim();
  if (!query) return { type: "none" };

  if (isTokenAddress(query) || isWalletLikeAddress(query)) {
    return { type: "address", href: `/address/${query}` };
  }

  if (isTransactionHash(query)) {
    return { type: "tx", href: `/tx/${query}` };
  }

  if (isDfsNameQuery(query)) {
    const wallet = await resolveWalletByDfsName(query);
    if (wallet) {
      return { type: "address", href: `/address/${wallet}` };
    }
    return { type: "none" };
  }

  const tokenAddress = await findTokenAddressByQuery(query);
  if (tokenAddress) {
    return { type: "address", href: `/address/${tokenAddress}` };
  }

  return { type: "none" };
}
