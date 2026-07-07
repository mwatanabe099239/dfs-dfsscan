import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/src/config/firebase-admin";
import { getWalletBalanceForAddress } from "@/src/lib/wallet-balance-server";
import { isWalletLikeAddress } from "@/src/lib/address";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim() ?? "";

  if (!address || !isWalletLikeAddress(address)) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { nativeTokenBalance: "0", tokens: [], adminConfigured: false },
      { status: 200 }
    );
  }

  try {
    const wallet = await getWalletBalanceForAddress(db, address);
    if (!wallet) {
      return NextResponse.json({
        nativeTokenBalance: "0",
        tokens: [],
        adminConfigured: true,
      });
    }

    return NextResponse.json({
      ...wallet,
      adminConfigured: true,
    });
  } catch (e) {
    console.error("GET /api/wallet-balance", e);
    return NextResponse.json(
      { error: "Failed to load wallet balance" },
      { status: 500 }
    );
  }
}
