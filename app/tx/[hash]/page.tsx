import { Metadata } from 'next'
import TransactionDetailView from './TransactionDetailView'

interface PageProps {
  params: Promise<{ hash: string }>
}

async function TransactionDetail({ params }: PageProps) {
  const { hash } = await params
  return <TransactionDetailView hash={hash} />
}

export default TransactionDetail