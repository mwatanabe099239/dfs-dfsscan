import Link from "next/link";
import { Transaction } from "@/src/types";
import { formatTimeAgo, shortenAddress, shortenHash } from "@/src/lib/utils";
import { Copy, MoveRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TokenTransactions({
  transactions,
  address,
  totalCount,
}: {
  transactions: Transaction[];
  address: string;
  totalCount: number;
}) {
  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast.success("Copied!");
  };

  const isTokenTransfer = address.startsWith("drc20_0x");

  const ZERO_ADDRESS = "dfs_0x0000000000000000000000000000000000000000";

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Latest {transactions.length > 25 ? "25" : transactions.length}{" "}
            Transactions from a total of{" "}
          </span>
          <span className="text-[#0784c3]">{totalCount.toLocaleString()}</span>
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
              <th className="p-3 whitespace-nowrap"></th>
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
                <td className="p-3 flex items-center gap-2">
                  <Link
                    href={`/tx/${tx.transactionHash}`}
                    className="text-[#0784c3] hover:text-blue-600"
                  >
                    {shortenHash(tx.transactionHash)}
                  </Link>
                  <Copy
                    className="w-4 h-4 text-gray-500 cursor-pointer"
                    onClick={() => handleCopyTx(tx.transactionHash)}
                  />
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
                <td className="p-3 flex items-center gap-2">
                  {tx.method === "Token Created" ? (
                    <>
                      <Link
                        href={`/address/${ZERO_ADDRESS}`}
                        className="text-[#0784c3] hover:text-blue-600"
                      >
                        {shortenAddress(ZERO_ADDRESS)}
                      </Link>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(ZERO_ADDRESS)}
                      />
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/address/${tx.fromAddress}`}
                        className="text-[#0784c3] hover:text-blue-600"
                      >
                        {shortenAddress(tx.fromAddress)}
                      </Link>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(tx.fromAddress)}
                      />
                    </>
                  )}
                </td>
                <td className="p-3">
                  {isTokenTransfer ? (
                    <div className="bg-[#00a18610] border border-[#00a18630] rounded-full text-center h-6 w-6 flex items-center justify-center">
                      <MoveRight className="w-4 h-auto text-[#00a186]" />
                    </div>
                  ) : (
                    <>
                      {address === tx.fromAddress ? (
                        <div className="bg-[#cc9a0610] border border-[#cc9a0630] text-[#cc9a06] flex items-center justify-center h-6 w-10 text-center rounded-md text-[10px] font-medium">
                          OUT
                        </div>
                      ) : (
                        <div className="bg-[#00a18610] border border-[#00a18630] text-[#00a186] flex items-center justify-center h-6 w-10 text-center rounded-md text-[10px] font-medium">
                          IN
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className="p-3 flex items-center gap-2">
                  {tx.method === "Token Created" ? (
                    <>
                      <Link
                        href={`/address/${tx.fromAddress}`}
                        className="text-[#0784c3] hover:text-blue-600"
                      >
                        {shortenAddress(tx.fromAddress)}
                      </Link>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(tx.fromAddress)}
                      />
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/address/${tx.toAddress}`}
                        className="text-[#0784c3] hover:text-blue-600"
                      >
                        {shortenAddress(tx.toAddress)}
                      </Link>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer"
                        onClick={() => handleCopyTx(tx.toAddress)}
                      />
                    </>
                  )}
                </td>
                <td className="p-3">
                  {tx.amount}{" "}
                  {tx.method === "Transfer" ? tx.token?.symbol || "DFS" : "DFS"}
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
    </>
  );
}
