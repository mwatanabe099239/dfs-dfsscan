"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import type { ScanNftHolding } from "@/src/types";
import { shortenAddress, shortenHash } from "@/src/lib/utils";

type Variant = "bsc" | "solana";

const linkClass: Record<Variant, string> = {
  bsc: "text-[#0784c3] hover:text-[#066a9e] hover:underline",
  solana: "text-[#009978] hover:text-[#008066] hover:underline",
};

export default function WalletNftsEtherscanTable({
  nfts,
  variant = "bsc",
}: {
  nfts: ScanNftHolding[];
  variant?: Variant;
}) {
  const link = linkClass[variant];

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  if (nfts.length === 0) {
    return (
      <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white px-4 py-14 text-center text-sm text-gray-500">
        There are no NFTs currently held by this address.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-b-lg border border-t-0 border-gray-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-[#f8f9fa] text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            <th className="w-20 px-3 py-2.5 font-medium">Image</th>
            <th className="px-3 py-2.5 font-medium">Collection</th>
            <th className="px-3 py-2.5 font-medium">Token ID</th>
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="w-24 px-3 py-2.5 font-medium text-right"> </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {nfts.map((nft) => (
            <tr
              key={`${nft.collectionId}-${nft.tokenId}`}
              className="align-middle hover:bg-gray-50/80"
            >
              <td className="px-3 py-2">
                <div className="relative h-11 w-11 overflow-hidden rounded border border-gray-200 bg-gray-100">
                  {nft.image ? (
                    <Image
                      src={nft.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="44px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                      —
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/address/${encodeURIComponent(nft.collectionId)}`}
                  className={`font-mono text-xs font-medium ${link}`}
                  title={nft.collectionId}
                >
                  {shortenAddress(nft.collectionId, 10, 6)}
                </Link>
                {nft.state ? (
                  <div className="mt-0.5 text-[11px] text-gray-500">
                    State: {nft.state}
                  </div>
                ) : null}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-gray-800">
                <span title={nft.tokenId}>{shortenHash(nft.tokenId, 18)}</span>
              </td>
              <td className="max-w-[220px] px-3 py-2 text-gray-800">
                <span className="line-clamp-2" title={nft.name}>
                  {nft.name}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => copy(`${nft.collectionId} / ${nft.tokenId}`)}
                  className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
                  aria-label="Copy collection and token id"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-gray-200 bg-[#f8f9fa] px-3 py-2 text-xs text-gray-500">
        A total of {nfts.length} NFT{nfts.length === 1 ? "" : "s"} found
      </div>
    </div>
  );
}
