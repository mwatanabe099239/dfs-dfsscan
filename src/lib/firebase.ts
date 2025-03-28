import { initializeApp } from 'firebase/app'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
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
  const totalTransactions = snapshot.size
  const baseFee = "1" // Assuming 1 DFS as mentioned
  const latestBlock = calculateBlockNumber()

  return {
    latestBlock,
    totalTransactions,
    baseFee
  }
} 

export async function getLatestBlocks(): Promise<Block[]> {
  const latestBlock = calculateBlockNumber();
  const blockNumbers = Array.from({ length: 6 }, (_, i) => latestBlock - i);

  // Fetch transactions for these blocks
  const txQuery = query(
    collection(db, 'transactions'),
    where('blockNumber', 'in', blockNumbers)
  );
  const txSnapshot = await getDocs(txQuery);
  const transactions = txSnapshot.docs.map(doc => doc.data());

  // Group transactions by block number and calculate stats
  const blockMap = new Map<number, Block>();
  
  blockNumbers.forEach(blockNum => {
    const blockTxs = transactions.filter(tx => tx.blockNumber === blockNum);
    const totalReward = blockTxs
      .reduce((sum, tx) => sum + parseFloat(tx.gasFee), 0)
      .toString();
    
    const timestamp = new Date(FIRST_BLOCK_TIME).getTime() + (blockNum * BLOCK_GENERATION_TIME);

    blockMap.set(blockNum, {
      number: blockNum,
      timestamp: timestamp / 1000, // Convert to seconds
      transactions: blockTxs.length,
      reward: totalReward
    });
  });

  return Array.from(blockMap.values()).sort((a, b) => b.number - a.number);
}

export const BLOCK_GENERATION_TIME = 5 * 60 * 1000; // 5 minutes
export const FIRST_BLOCK_TIME = "2025-03-26T00:00:00Z";

export function calculateBlockNumber() {
  const currentTimestamp = new Date();
  const blockNumber = Math.floor(
    (currentTimestamp.getTime() - new Date(FIRST_BLOCK_TIME).getTime()) /
      BLOCK_GENERATION_TIME
  );
  return blockNumber;
}

export async function getBlocks(page: number, perPage: number): Promise<Block[]> {
  const latestBlock = calculateBlockNumber();
  
  // Calculate the range of blocks for the current page
  const startBlock = latestBlock - ((page - 1) * perPage);
  const endBlock = Math.max(0, startBlock - (perPage - 1));
  
  // Get transactions for each block
  const blockMap = new Map<number, Block>();
  
  for (let blockNum = startBlock; blockNum >= endBlock; blockNum--) {
    const timestamp = new Date(FIRST_BLOCK_TIME).getTime() + (blockNum * BLOCK_GENERATION_TIME);
    
    // Get transactions for this block
    const txQuery = query(
      collection(db, 'transactions'),
      where('blockNumber', '==', blockNum)
    );
    
    const txSnapshot = await getDocs(txQuery);
    const blockTxs = txSnapshot.docs;
    
    // Calculate total reward (sum of gas fees)
    const totalReward = blockTxs.reduce((sum, tx) => {
      return sum + (tx.data().gasFee || 0);
    }, 0);

    blockMap.set(blockNum, {
      number: blockNum,
      timestamp: timestamp / 1000, // Convert to seconds for consistency
      transactions: blockTxs.length,
      reward: totalReward.toString()
    });
  }

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

export async function getTransactions(page: number, perPage: number): Promise<Transaction[]> {
  const txQuery = query(
    collection(db, 'transactions'),
    orderBy('createdAt', 'desc'),
    limit(perPage)
  );

  const snapshot = await getDocs(txQuery);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Transaction[];
}

export async function getTransactionsByAddress(address: string): Promise<Transaction[]> {
  const txQuery = query(
    collection(db, 'transactions'),
    where('fromAddress', '==', address),
    orderBy('createdAt', 'desc')
  );

  const toQuery = query(
    collection(db, 'transactions'),
    where('toAddress', '==', address),
    orderBy('createdAt', 'desc')
  );

  const [fromSnapshot, toSnapshot] = await Promise.all([
    getDocs(txQuery),
    getDocs(toQuery)
  ]);

  // Create a Map to store unique transactions by hash
  const uniqueTransactions = new Map();

  // Add all transactions to the Map (this will automatically handle duplicates)
  [...fromSnapshot.docs, ...toSnapshot.docs].forEach(doc => {
    const data = doc.data();
    uniqueTransactions.set(data.transactionHash, {
      ...data,
      createdAt: data.createdAt.toDate()
    });
  });

  // Convert Map values back to array
  return Array.from(uniqueTransactions.values()) as Transaction[];
}

export async function getNativeBalance(address: string): Promise<string> {
  const userQuery = query(
    collection(db, 'users'),
    where('walletAddress', '==', address),
    limit(1)
  );
  
  const snapshot = await getDocs(userQuery);
  if (snapshot.empty) {
    return '0';
  }
  
  return snapshot.docs[0].data().nativeTokenBalance || '0';
}

export async function getUserTokens(address: string): Promise<any[]> {
  const userQuery = query(
    collection(db, 'users'),
    where('walletAddress', '==', address),
    limit(1)
  );
  
  const snapshot = await getDocs(userQuery);
  if (snapshot.empty) {
    return [];
  }
  
  const userData = snapshot.docs[0].data();
  return userData.tokens || [];
}

export async function getTokenData(tokenAddress: string) {
  const tokenQuery = query(
    collection(db, 'tokens'),
    where('tokenAddress', '==', tokenAddress),
    limit(1)
  );
  
  const snapshot = await getDocs(tokenQuery);
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data();
}

export async function getTokenHolders(tokenAddress: string) {
  const usersQuery = query(
    collection(db, 'users'),
    where('tokenHoldings', 'array-contains', tokenAddress)
  );
  
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map(doc => doc.data());
}

export async function getTokenTransactions(tokenAddress: string) {
  const txQuery = query(
    collection(db, 'transactions'),
    where('token.tokenAddress', '==', tokenAddress)
  );
  
  const snapshot = await getDocs(txQuery);
  const transactions = snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  }));

  // Sort in memory instead
  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}