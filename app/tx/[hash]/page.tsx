import { Metadata } from 'next'
import TransactionDetailView from './TransactionDetailView'

interface PageProps {
  params: Promise<{ hash: string }>
}

async function TransactionDetail({ params }: PageProps) {
  const { hash } = await params
  return (
    <div className="container mx-auto px-4">
      <TransactionDetailView hash={hash} />
    </div>
  )
}

export default TransactionDetail