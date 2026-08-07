"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveWalletMeta } from "@/src/lib/dfsName";
import { isUserWalletAddress, normalizeAddress } from "@/src/lib/address";

export function useDfsNames(addresses: Array<string | null | undefined>) {
  const unique = useMemo(() => {
    return [
      ...new Set(
        addresses
          .filter(Boolean)
          .map((a) => normalizeAddress(String(a)))
          .filter((a) => isUserWalletAddress(a))
      ),
    ].sort();
  }, [addresses]);

  const queryKey = useMemo(() => ["dfs-wallet-meta", unique.join("|")], [unique]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => resolveWalletMeta(unique),
    enabled: unique.length > 0,
    staleTime: 60_000,
  });

  return {
    meta: data || {},
    names: Object.fromEntries(
      Object.entries(data || {}).map(([k, v]) => [k, v.name])
    ) as Record<string, string | null>,
    isLoading,
    label: (address: string, start = 15, end = 7) => {
      if (!address) return "";
      const key = normalizeAddress(address);
      const name = data?.[key]?.name;
      if (name) return name;
      if (address.length <= start + end) return address;
      return `${address.slice(0, start)}...${address.slice(-end)}`;
    },
    verified: (address: string) => {
      if (!address) return false;
      return !!data?.[normalizeAddress(address)]?.verified;
    },
    badge: (address: string) => {
      if (!address) return null;
      return data?.[normalizeAddress(address)]?.badge || null;
    },
  };
}
