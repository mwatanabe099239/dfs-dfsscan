import { getTokenPrice } from "@/src/services/dextool-token-price";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenAddress = searchParams.get("address");

  if (!tokenAddress) {
    return NextResponse.json(
      { error: "Token address is required" },
      { status: 400 }
    );
  }

  try {
    const tokenPrice = await getTokenPrice(tokenAddress);

    if (!tokenPrice) {
      return NextResponse.json(
        { error: "Failed to fetch token price" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: tokenPrice }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching token price from DexTool:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch token price" },
      { status: 500 }
    );
  }
}

