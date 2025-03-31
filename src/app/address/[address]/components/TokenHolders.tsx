import Link from "next/link";

type Holder = {
  walletAddress: string;
  tokens: HolderToken[];
};
type HolderToken = {
  address: string;
  balance: string;
  tokenAddress: string;
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
  // Sort holders by token balance
  const sortedHolders = holders
    .map((holder) => {
      const tokenHolding = holder.tokens.find(
        (t: HolderToken) => t.tokenAddress === tokenAddress
      );
      return {
        address: holder.walletAddress,
        balance: tokenHolding ? Number(tokenHolding.balance) : 0,
      };
    })
    .sort((a, b) => b.balance - a.balance) // Sort in descending order
    .filter((holder) => holder.balance > 0); // Optional: remove zero balance holders

  const totalSupplyNum = Number(totalSupply);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm border-b border-gray-200">
            <th className="p-3">Rank</th>
            <th className="p-3">Address</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Percentage</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {sortedHolders.map((holder, index) => (
            <tr
              key={holder.address}
              className={`${
                index !== sortedHolders.length - 1
                  ? "border-b border-gray-200"
                  : ""
              } hover:bg-gray-50`}
            >
              <td className="p-3 text-gray-500">{index + 1}</td>
              <td className="p-3">
                <Link
                  href={`/address/${holder.address}`}
                  className="text-[#0784c3] hover:text-blue-600"
                >
                  {holder.address}
                </Link>
              </td>
              <td className="p-3">{holder.balance.toLocaleString()}</td>
              <td className="p-3">
                {((holder.balance / totalSupplyNum) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
