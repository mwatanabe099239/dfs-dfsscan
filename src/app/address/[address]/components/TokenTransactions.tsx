import Link from "next/link";
import { Transaction } from "@/src/types";
import { formatTimeAgo } from "@/src/lib/utils";

export default function TokenTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span>
            Latest {transactions.length > 25 ? "25" : transactions.length}{" "}
            Transactions from a total of{" "}
          </span>
          <span className="text-blue-500">
            {transactions.length.toLocaleString()}
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
              <th className="p-3 whitespace-nowrap text-right">Amount</th>
              <th className="p-3 whitespace-nowrap text-right">Gas Fee</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.transactionHash}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3">
                  <Link
                    href={`/tx/${tx.transactionHash}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {tx.transactionHash.slice(0, 12)}...
                  </Link>
                </td>
                <td className="p-3">
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {tx.method || "Transfer"}
                  </span>
                </td>
                <td className="p-3">
                  <Link
                    href={`/block/${tx.blockNumber}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {tx.blockNumber}
                  </Link>
                </td>
                <td className="p-3 text-gray-500">
                  {formatTimeAgo(tx.createdAt.getTime() / 1000)}
                </td>
                <td className="p-3">
                  <Link
                    href={`/address/${tx.fromAddress}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {tx.fromAddress.slice(0, 8)}...
                  </Link>
                </td>
                <td className="p-3">
                  <Link
                    href={`/address/${tx.toAddress}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {tx.toAddress.slice(0, 8)}...
                  </Link>
                </td>
                <td className="p-3 text-right">
                  {tx.amount} {tx.token?.symbol || "DFS"}
                </td>
                <td className="p-3 text-right">{tx.gasFee} DFS</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
