import { initializeApp } from "firebase/app";
import { getFirestore, or } from "firebase/firestore";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  startAt,
  startAfter,
} from "firebase/firestore";
import { Transaction } from "../types";
import { Block } from "../types";
import { getCountFromServer } from "firebase/firestore";
import { NON_USER_ADDRESS } from "./constant";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export async function getNetworkStats() {
  const txQuery = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc")
  );

  const txCount = await getCountFromServer(txQuery);
  const totalTransactions = txCount.data().count;
  const baseFee = "1"; // Assuming 1 DFS as mentioned
  const latestBlock = calculateBlockNumber();

  return {
    latestBlock,
    totalTransactions,
    baseFee,
  };
}

export async function getLatestBlocks(): Promise<Block[]> {
  const latestBlock = calculateBlockNumber();
  const blockNumbers = Array.from({ length: 6 }, (_, i) => latestBlock - i);

  // Fetch transactions for these blocks
  const txQuery = query(
    collection(db, "transactions"),
    where("blockNumber", "in", blockNumbers)
  );
  const txSnapshot = await getDocs(txQuery);
  const transactions = txSnapshot.docs.map((doc) => doc.data());

  // Group transactions by block number and calculate stats
  const blockMap = new Map<number, Block>();

  blockNumbers.forEach((blockNum) => {
    const blockTxs = transactions.filter((tx) => tx.blockNumber === blockNum);
    const totalReward = blockTxs
      .reduce((sum, tx) => sum + parseFloat(tx.gasFee), 0)
      .toString();

    const timestamp =
      new Date(FIRST_BLOCK_TIME).getTime() + blockNum * BLOCK_GENERATION_TIME;

    blockMap.set(blockNum, {
      number: blockNum,
      timestamp: timestamp / 1000, // Convert to seconds
      transactions: blockTxs.length,
      reward: totalReward,
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

export async function getBlocks(
  page: number,
  perPage: number
): Promise<Block[]> {
  const latestBlock = calculateBlockNumber();

  // Calculate the range of blocks for the current page
  const startBlock = latestBlock - (page - 1) * perPage;
  const endBlock = Math.max(0, startBlock - (perPage - 1));

  // Get transactions for each block
  const blockMap = new Map<number, Block>();

  for (let blockNum = startBlock; blockNum >= endBlock; blockNum--) {
    const timestamp =
      new Date(FIRST_BLOCK_TIME).getTime() + blockNum * BLOCK_GENERATION_TIME;

    // Get transactions for this block
    const txQuery = query(
      collection(db, "transactions"),
      where("blockNumber", "==", blockNum)
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
      reward: totalReward.toString(),
    });
  }

  return Array.from(blockMap.values()).sort((a, b) => b.number - a.number);
}

export async function getLatestTransactions(): Promise<Transaction[]> {
  const txQuery = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(6)
  );

  const snapshot = await getDocs(txQuery);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];
}

export async function getTransactionByHash(
  hash: string
): Promise<Transaction | null> {
  const txQuery = query(
    collection(db, "transactions"),
    where("transactionHash", "==", hash),
    limit(1)
  );

  const snapshot = await getDocs(txQuery);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  } as Transaction;
}

export async function getTransactionsWithPagination(
  page: number,
  perPage: number
): Promise<{ transactions: Transaction[]; total: number }> {
  // Query for total count
  const countQuery = query(collection(db, "transactions"));

  // Get the total count
  const countSnapshot = await getCountFromServer(countQuery);
  const total = countSnapshot.data().count;

  // Calculate the number of pages to skip
  const pagesToSkip = page - 1;

  // Query for the first set of documents
  let txQuery = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(perPage)
  );

  let lastVisible;
  for (let i = 0; i < pagesToSkip; i++) {
    const documentSnapshots = await getDocs(txQuery);
    lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    if (lastVisible) {
      txQuery = query(
        collection(db, "transactions"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(perPage)
      );
    }
  }

  // Get the paginated documents
  const txSnapshot = await getDocs(txQuery);

  const transactions = txSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];

  return {
    transactions,
    total,
  };
}

export async function getTokenTotalTransactionWithPagination(
  tokenAddress: string,
  page: number,
  perPage: number
): Promise<{ transactions: Transaction[]; total: number }> {
  // Query for total count
  const countQuery = query(
    collection(db, "transactions"),
    where("token.tokenAddress", "==", tokenAddress)
  );

  // Get the total count
  const countSnapshot = await getCountFromServer(countQuery);
  const total = countSnapshot.data().count;

  // Calculate the number of pages to skip
  const pagesToSkip = page - 1;

  // Query for the first set of documents
  let txQuery = query(
    collection(db, "transactions"),
    where("token.tokenAddress", "==", tokenAddress),
    orderBy("createdAt", "desc"),
    limit(perPage)
  );

  let lastVisible;
  for (let i = 0; i < pagesToSkip; i++) {
    const documentSnapshots = await getDocs(txQuery);
    lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    if (lastVisible) {
      txQuery = query(
        collection(db, "transactions"),
        where("token.tokenAddress", "==", tokenAddress),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(perPage)
      );
    }
  }

  // Get the paginated documents
  const txSnapshot = await getDocs(txQuery);

  const transactions = txSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];

  return {
    transactions,
    total,
  };
}

export async function getAddressTotalTransactionWithPagination(
  address: string,
  page: number,
  perPage: number
): Promise<{ transactions: Transaction[]; total: number }> {
  const countQuery = query(
    collection(db, "transactions"),
    or(where("toAddress", "==", address), where("fromAddress", "==", address))
  );

  const countSnapshot = await getCountFromServer(countQuery);
  const total = countSnapshot.data().count;

  const pagesToSkip = page - 1;

  let txQuery = query(
    collection(db, "transactions"),
    or(where("toAddress", "==", address), where("fromAddress", "==", address)),
    orderBy("createdAt", "desc"),
    limit(perPage)
  );

  let lastVisible;
  for (let i = 0; i < pagesToSkip; i++) {
    const documentSnapshots = await getDocs(txQuery);
    lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    if (lastVisible) {
      txQuery = query(
        collection(db, "transactions"),
        or(
          where("toAddress", "==", address),
          where("fromAddress", "==", address)
        ),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(perPage)
      );
    }
  }

  const txSnapshot = await getDocs(txQuery);

  const transactions = txSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];

  return {
    transactions,
    total,
  };
}

export async function getTransactionsByAddress(
  address: string
): Promise<Transaction[]> {
  const txQuery = query(
    collection(db, "transactions"),
    or(where("toAddress", "==", address), where("fromAddress", "==", address)),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(txQuery);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];
}

export async function getTransactionsByAddressWithLimitWithTotalCount(
  address: string,
  limitNumber: number
): Promise<{ transactions: Transaction[]; totalCount: number }> {
  // Query for total count
  const countQuery = query(
    collection(db, "transactions"),
    or(where("toAddress", "==", address), where("fromAddress", "==", address))
  );

  const txQuery = query(
    collection(db, "transactions"),
    or(where("toAddress", "==", address), where("fromAddress", "==", address)),
    orderBy("createdAt", "desc"),
    limit(limitNumber)
  );

  // Execute both queries in parallel
  const [countSnapshot, txSnapshot] = await Promise.all([
    getCountFromServer(countQuery),
    getDocs(txQuery),
  ]);

  const transactions = txSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];

  return {
    transactions,
    totalCount: countSnapshot.data().count,
  };
}

export async function getNativeBalance(address: string): Promise<string> {
  let userQuery;
  let snapshot;
  if (NON_USER_ADDRESS.includes(address)) {
    userQuery = query(
      collection(db, "non_users"),
      where("walletAddress", "==", address),
      limit(1)
    );

    snapshot = await getDocs(userQuery);
  }else {
    userQuery = query(
      collection(db, "users"),
      where("walletAddress", "==", address),
      limit(1)
    );
  
    snapshot = await getDocs(userQuery);
  }

  
  if (snapshot.empty) {
    return "0";
  }

  return snapshot.docs[0].data().nativeTokenBalance || "0";
}

export async function getUserTokens(address: string): Promise<any[]> {
  let userQuery;
  let snapshot;
  if (NON_USER_ADDRESS.includes(address)) {
    userQuery = query(
      collection(db, "non_users"),
      where("walletAddress", "==", address),
      limit(1)
    );

    snapshot = await getDocs(userQuery);
  }else {
    userQuery = query(
      collection(db, "users"),
      where("walletAddress", "==", address),
      limit(1)
    );

    snapshot = await getDocs(userQuery);
  }

  if (snapshot.empty) {
    return [];
  }

  const userData = snapshot.docs[0].data();
  return userData.tokens || [];
}

export async function getTokenData(tokenAddress: string) {
  const tokenQuery = query(
    collection(db, "tokens"),
    where("tokenAddress", "==", tokenAddress),
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
    collection(db, "users"),
    where("tokenHoldings", "array-contains", tokenAddress)
  );

  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((doc) => doc.data());
}

export async function getTokenTransactions(tokenAddress: string) {
  const txQuery = query(
    collection(db, "transactions"),
    where("token.tokenAddress", "==", tokenAddress)
  );

  const snapshot = await getDocs(txQuery);
  const transactions = snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));

  // Sort in memory instead
  return transactions.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getTokenTransactionsWithLimitWithTotalCount(
  tokenAddress: string,
  limitNumber: number
): Promise<{ transactions: Transaction[]; totalCount: number }> {
  const txQuery = query(
    collection(db, "transactions"),
    where("token.tokenAddress", "==", tokenAddress),
    orderBy("createdAt", "desc"),
    limit(limitNumber)
  );

  const countQuery = query(
    collection(db, "transactions"),
    where("token.tokenAddress", "==", tokenAddress)
  );

  const [txSnapshot, countSnapshot] = await Promise.all([
    getDocs(txQuery),
    getCountFromServer(countQuery),
  ]);

  const transactions = txSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];

  return {
    transactions,
    totalCount: countSnapshot.data().count,
  };
}
