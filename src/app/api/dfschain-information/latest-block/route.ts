import { NextRequest, NextResponse } from "next/server";
import { calculateBlockNumber } from "@/src/services/dfschain-information";

export async function GET(_request: NextRequest) {
  const latestBlock = calculateBlockNumber();

  if (!latestBlock) {
    return NextResponse.json(
      { error: "Failed to fetch latest block" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: latestBlock }, { status: 200 });
}
