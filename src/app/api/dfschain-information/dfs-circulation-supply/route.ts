import { NextRequest, NextResponse } from "next/server";
import { getDfsCirculationSupply } from "@/src/services/dfschain-information";

export async function GET(_request: NextRequest) {
  const circulationSupply = await getDfsCirculationSupply();

  if (!circulationSupply) {
    return NextResponse.json({ error: "Failed to fetch circulation supply" }, { status: 500 });
  }

  return NextResponse.json({ data: circulationSupply }, { status: 200 });
}