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

  try {
    const holdersCount = await getHoldersCount(tokenAddress);

    return NextResponse.json({ data: holdersCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching holders count:", error);
    return NextResponse.json(
      { error: "Failed to fetch holders count" },
      { status: 500 }
    );
  }
}
