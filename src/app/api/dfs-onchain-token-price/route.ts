import { getTokenPrice } from "@/src/services/dfs-onchain-token-price";
import { NextResponse } from "next/server";

const DFS_ONCHAIN_TOKEN_ADDRESS = "0x56d31ec7da5d0ab43683654dc524ad509fe4fa4f";

export async function GET(_request: Request) {
  const tokenPrice = await getTokenPrice(DFS_ONCHAIN_TOKEN_ADDRESS);
  console.log("tokenPrice", tokenPrice);
  if (!tokenPrice) {
    return NextResponse.json(
      { error: "Failed to fetch token price" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: tokenPrice }, { status: 200 });
}
