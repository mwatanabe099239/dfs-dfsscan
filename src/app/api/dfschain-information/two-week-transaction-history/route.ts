import { NextRequest, NextResponse } from "next/server";
import { getTwoWeekTransactionHistory } from "@/src/services/dfschain-information";

export async function GET(_request: NextRequest) {
  const twoWeekTransactionHistory = await getTwoWeekTransactionHistory();

  if (!twoWeekTransactionHistory) {
    return NextResponse.json(
      { error: "Failed to fetch two week transaction history" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: twoWeekTransactionHistory },
    { status: 200 }
  );
}
