import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/src/config/firebase-admin";
import { getWalletNftsForAddress } from "@/src/lib/wallet-nfts-server";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim() ?? "";
  const lower = address.toLowerCase();
  if (!lower.startsWith("dfs_0x")) {
    return NextResponse.json({ nfts: [] });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { nfts: [], adminConfigured: false },
      { status: 200 }
    );
  }

  try {
    const nfts = await getWalletNftsForAddress(db, address);
    return NextResponse.json({ nfts, adminConfigured: true });
  } catch (e) {
    console.error("GET /api/wallet-nfts", e);
    return NextResponse.json(
      { error: "Failed to load NFTs" },
      { status: 500 }
    );
  }
}
