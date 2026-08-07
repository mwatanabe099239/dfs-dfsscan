"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
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
  const { label, verified, badge } = useDfsNames(
    isUserWalletAddress(address) ? [address] : []
  );

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

  const showBadge = isUserWalletAddress(address) && verified(address);
  const awarded = showBadge ? badge(address) : null;
  const badgeLabel =
    awarded?.description || awarded?.title || "Verified name";

  const content = (
    <span className="inline-flex items-center gap-1">
      <span>{resolvedLabel}</span>
      {showBadge &&
        (awarded?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={awarded.imageUrl}
            alt={badgeLabel}
            title={badgeLabel}
            className="inline-block h-3.5 w-3.5 shrink-0 rounded-full object-cover"
          />
        ) : (
          <BadgeCheck
            className="inline h-3.5 w-3.5 shrink-0"
            fill="currentColor"
            absoluteStrokeWidth
            strokeWidth={2.25}
            style={{
              color: awarded?.color || "#0ea5e9",
              stroke: "var(--background, #fff)",
            }}
            aria-label={badgeLabel}
          />
        ))}
    </span>
  );

  if (!link) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link
      href={href || `/address/${address}`}
      className={className}
      title={address}
    >
      {content}
    </Link>
  );
}
