import Link from "next/link";

type Holder = {
  walletAddress: string;
  tokens: Array<{
    address: string;
    balance: string;
    tokenAddress: string;
  }>;
};

export default function TokenHolders({
  holders,
  totalSupply,
  tokenAddress,
}: {
  holders: Holder[];
  totalSupply: string;
  tokenAddress: string;
}) {
  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
              <th className="p-3">Rank</th>
              <th className="p-3">Address</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Percentage</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {holders.map((holder, index) => {
              const tokenHolding = holder.tokens.find(
                (t) => t.tokenAddress === tokenAddress
              );
              const percentage =
                ((Number(tokenHolding?.balance) || 0) / Number(totalSupply)) *
                100;

              return (
                <tr
                  key={holder.walletAddress}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <Link
                      href={`/address/${holder.walletAddress}`}
                      className="text-[#0784c3] hover:text-blue-600"
                    >
                      {holder.walletAddress}
                    </Link>
                  </td>
                  <td className="p-3">{tokenHolding?.balance || "0"}</td>
                  <td className="p-3">{percentage.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
