import { notFound } from "next/navigation";
import { getTransactionByHash } from "@/src/lib/firebase";
import TransactionDetailView from "./TransactionDetailView";

type PageProps = {
  params: Promise<{ hash: string }>
}

export default async function TransactionDetail({ params }: PageProps) {
  const { hash } = await params;
  const transaction = await getTransactionByHash(hash)

  if (!transaction) {
    notFound()
  }

  return (
    <div className={`container mx-auto px-4`}>
      <TransactionDetailView transaction={transaction} />
    </div>
  )
}