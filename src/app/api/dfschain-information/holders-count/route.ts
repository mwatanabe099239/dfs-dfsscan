import { NextRequest, NextResponse } from "next/server";
import { getHoldersCount } from "@/src/services/dfschain-information";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenAddress = searchParams.get("tokenAddress");

  if (!tokenAddress) {
    return NextResponse.json(
      { error: "Token address is required" },
      { status: 400 }
    );
  }

  const holdersCount = await getHoldersCount(tokenAddress);

  if (!holdersCount) {
    return NextResponse.json(
      { error: "Failed to fetch holders count" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: holdersCount }, { status: 200 });
}
