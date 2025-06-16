import { NextRequest, NextResponse } from "next/server";
import { getDfsBaseFee } from "@/src/services/dfschain-information";

export async function GET(_request: NextRequest) {
  const baseFee = await getDfsBaseFee();

  if (!baseFee) {
    return NextResponse.json(
      { error: "Failed to fetch base fee" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: baseFee }, { status: 200 });
}
