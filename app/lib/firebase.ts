import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { Transaction } from '../types'
import { Block } from '../types'
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

export async function getNetworkStats() {
  const txQuery = query(
    collection(db, 'transactions'),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(txQuery)
  const transactions = snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Transaction[]

  const latestBlock = transactions[0]?.blockNumber || 0
  const totalTransactions = snapshot.size
  const baseFee = "1" // Assuming 1 DFS as mentioned

  return {
    latestBlock,
    totalTransactions,
    baseFee
  }
} 

export async function getLatestBlocks(): Promise<Block[]> {
  // Get the latest block number from network stats
  const { latestBlock } = await getNetworkStats();

  // Generate array of last 6 block numbers
  const blockNumbers = Array.from({ length: 6 }, (_, i) => latestBlock - i);

  // Fetch transactions for these blocks
  const txQuery = query(
    collection(db, 'transactions'),
    where('blockNumber', 'in', blockNumbers)
  );
  const txSnapshot = await getDocs(txQuery);
  const transactions = txSnapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Transaction[];

  // Get latest timestamp from transactions
  const latestTimestamp = transactions.length > 0
    ? Math.max(...transactions.map(tx => tx.createdAt.getTime() / 1000))
    : Math.floor(Date.now() / 1000);

  // Group transactions by block number and calculate stats
  const blockMap = new Map<number, Block>();
  
  blockNumbers.forEach((blockNum, index) => {
    const blockTxs = transactions.filter(tx => tx.blockNumber === blockNum);
    const totalReward = blockTxs
      .reduce((sum, tx) => sum + parseFloat(tx.gasFee), 0)
      .toString();
    
    // Calculate timestamp by subtracting 5 minutes for each block from the latest
    const timestamp = latestTimestamp - (index * 5 * 60); // 5 minutes in seconds

    blockMap.set(blockNum, {
      number: blockNum,
      timestamp,
      transactions: blockTxs.length,
      reward: totalReward
    });
  });

  return Array.from(blockMap.values()).sort((a, b) => b.number - a.number);
}

export async function getBlocks(page: number, perPage: number): Promise<Block[]> {
  // Get the latest block number from network stats
  const { latestBlock } = await getNetworkStats();
  
  // Calculate the range of blocks for the current page
  const startBlock = latestBlock - ((page - 1) * perPage);
  const endBlock = Math.max(0, startBlock - (perPage - 1));
  
  // Generate array of block numbers for this page
  const blockNumbers = Array.from(
    { length: startBlock - endBlock + 1 },
    (_, i) => startBlock - i
  );

  // Fetch transactions for these blocks
  const txQuery = query(
    collection(db, 'transactions'),
    where('blockNumber', 'in', blockNumbers)
  );
  const txSnapshot = await getDocs(txQuery);
  const transactions = txSnapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Transaction[];

  // Get latest timestamp from transactions
  const latestTimestamp = transactions.length > 0
    ? Math.max(...transactions.map(tx => tx.createdAt.getTime() / 1000))
    : Math.floor(Date.now() / 1000);

  // Group transactions by block number and calculate stats
  const blockMap = new Map<number, Block>();
  
  blockNumbers.forEach((blockNum, index) => {
    const blockTxs = transactions.filter(tx => tx.blockNumber === blockNum);
    const totalReward = blockTxs
      .reduce((sum, tx) => sum + parseFloat(tx.gasFee), 0)
      .toString();
    
    // Calculate timestamp by subtracting 5 minutes for each block from the latest
    const timestamp = latestTimestamp - (index * 5 * 60); // 5 minutes in seconds

    blockMap.set(blockNum, {
      number: blockNum,
      timestamp,
      transactions: blockTxs.length,
      reward: totalReward
    });
  });

  return Array.from(blockMap.values()).sort((a, b) => b.number - a.number);
}

export async function getLatestTransactions(): Promise<Transaction[]> {
  const txQuery = query(
    collection(db, 'transactions'),
    orderBy('createdAt', 'desc'),
    limit(6)
  );

  const snapshot = await getDocs(txQuery);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Transaction[];
}

export async function getTransactionByHash(hash: string): Promise<Transaction | null> {
  const txQuery = query(
    collection(db, 'transactions'),
    where('transactionHash', '==', hash),
    limit(1)
  );

  const snapshot = await getDocs(txQuery);
  
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  } as Transaction;
}