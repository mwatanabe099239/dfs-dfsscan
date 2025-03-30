import Link from "next/link";
import { Transaction } from "@/src/types";
import { formatTimeAgo, shortenAddress, shortenHash } from "@/src/lib/utils";

export default function TokenTransactions({
  transactions,
  address,
  totalCount,
}: {
  transactions: Transaction[];
  address: string;
  totalCount: number;
}) {
  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Latest {transactions.length > 25 ? "25" : transactions.length}{" "}
            Transactions from a total of{" "}
          </span>
          <span className="text-[#0784c3]">
            {totalCount.toLocaleString()}
          </span>
          <span>transactions</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm border-b border-gray-200 bg-gray-50">
              <th className="p-3 whitespace-nowrap">Transaction Hash</th>
              <th className="p-3 whitespace-nowrap">Method</th>
              <th className="p-3 whitespace-nowrap">Block</th>
              <th className="p-3 whitespace-nowrap">Age</th>
              <th className="p-3 whitespace-nowrap">From</th>
              <th className="p-3 whitespace-nowrap">To</th>
              <th className="p-3 whitespace-nowrap">Amount</th>
              <th className="p-3 whitespace-nowrap">Gas Fee</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((tx, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 text-left"
              >
                <td className="p-3">
                  <Link
                    href={`/tx/${tx.transactionHash}`}
                    className="text-[#0784c3] hover:text-blue-600"
                  >
                    {shortenHash(tx.transactionHash)}
                  </Link>
                </td>
                <td className="p-3">
                  <span className="bg-gray-50 border-gray-200 border text-xs px-2 py-1 rounded">
                    {tx.method || "Transfer"}
                  </span>
                </td>
                <td className="p-3 text-[#0784c3]">{tx.blockNumber}</td>
                <td className="p-3">
                  {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                </td>
                <td className="p-3">
                  <Link
                    href={`/address/${tx.fromAddress}`}
                    className="text-[#0784c3] hover:text-blue-600"
                  >
                    {shortenAddress(tx.fromAddress)}
                  </Link>
                </td>
                <td className="p-3">
                  <Link
                    href={`/address/${tx.toAddress}`}
                    className="text-[#0784c3] hover:text-blue-600"
                  >
                    {shortenAddress(tx.toAddress)}
                  </Link>
                </td>
                <td className="p-3">
                  {tx.amount} {tx.token?.symbol || "DFS"}
                </td>
                <td className="p-3 text-gray-600 text-xs">{tx.gasFee} DFS</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 text-center text-sm">
        <Link
          href={`/txs?a=${address}`}
          className="text-[#0784c3] hover:text-blue-600 flex items-center justify-center gap-2"
        >
          VIEW ALL TRANSACTIONS
          <span className="text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
