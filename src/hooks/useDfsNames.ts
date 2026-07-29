"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveDfsNames } from "@/src/lib/dfsName";
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

  const queryKey = useMemo(() => ["dfs-names", unique.join("|")], [unique]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => resolveDfsNames(unique),
    enabled: unique.length > 0,
    staleTime: 60_000,
  });

  return {
    names: data || {},
    isLoading,
    label: (address: string, start = 15, end = 7) => {
      if (!address) return "";
      const key = normalizeAddress(address);
      const name = data?.[key];
      if (name) return name;
      if (address.length <= start + end) return address;
      return `${address.slice(0, start)}...${address.slice(-end)}`;
    },
  };
}
