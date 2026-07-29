"use client";

import Link from "next/link";
import { useDfsNames } from "@/src/hooks/useDfsNames";
import { shortenAddress } from "@/src/lib/utils";
import { isUserWalletAddress } from "@/src/lib/address";

type AddressDisplayProps = {
  address: string;
  href?: string;
  className?: string;
  start?: number;
  end?: number;
  /** When false, render plain text (no link). */
  link?: boolean;
  /** Prefer full address when no .dfs name is connected. */
  full?: boolean;
};

export default function AddressDisplay({
  address,
  href,
  className,
  start = 15,
  end = 7,
  link = true,
  full = false,
}: AddressDisplayProps) {
  const { label } = useDfsNames(isUserWalletAddress(address) ? [address] : []);

  if (!address) return null;

  let resolvedLabel: string;
  if (isUserWalletAddress(address)) {
    const named = label(address, start, end);
    if (named.endsWith(".dfs")) {
      resolvedLabel = named;
    } else {
      resolvedLabel = full ? address : named;
    }
  } else {
    resolvedLabel = full ? address : shortenAddress(address, start, end);
  }

  if (!link) {
    return <span className={className}>{resolvedLabel}</span>;
  }

  return (
    <Link
      href={href || `/address/${address}`}
      className={className}
      title={address}
    >
      {resolvedLabel}
    </Link>
  );
}
