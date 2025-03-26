import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTransactionByHash } from '../../lib/firebase'
import TransactionDetailView from './TransactionDetailView'

interface PageProps {
  params: { hash: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const transaction = await getTransactionByHash(params.hash)
  
  if (!transaction) {
    return {
      title: 'Transaction Not Found'
    }
  }

  return {
    title: `Transaction ${params.hash.slice(0, 10)}...`,
    description: `View transaction details for ${params.hash}`
  }
}

async function TransactionDetail({ params }: PageProps) {
  const transaction = await getTransactionByHash(params.hash)

  if (!transaction) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4">
      <TransactionDetailView transaction={transaction} />
    </div>
  )
}

export default TransactionDetail