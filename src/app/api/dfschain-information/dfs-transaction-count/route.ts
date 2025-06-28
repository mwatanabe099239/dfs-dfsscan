import { NextRequest, NextResponse } from "next/server";
import { getDfsTransactionCount } from "@/src/services/dfschain-information";

export async function GET(_request: NextRequest) {
  const searchParams = _request.nextUrl.searchParams;
  const duration = searchParams.get("duration"); // 1d, 7d, 30d, 90d, 180d, 360d, all

  try {
    const dfsTransactionCount = await getDfsTransactionCount(duration || "all");

    return NextResponse.json({ data: dfsTransactionCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching DFS transaction count:", error);
    return NextResponse.json(
      { error: "Failed to fetch DFS transaction count" },
      { status: 500 }
    );
  }
}
