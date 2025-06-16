import { NextRequest, NextResponse } from "next/server";
import { getDfsTransactionCount } from "@/src/services/dfschain-information";

export async function GET(_request: NextRequest) {
  const searchParams = _request.nextUrl.searchParams;
  const duration = searchParams.get("duration"); // 1d, 7d, 30d, 90d, 180d, 360d, all

  const dfsTransactionCount = await getDfsTransactionCount(duration || "all");

  if (!dfsTransactionCount) {
    return NextResponse.json(
      { error: "Failed to fetch DFS transaction count" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: dfsTransactionCount }, { status: 200 });
}
