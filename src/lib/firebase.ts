import { initializeApp } from "firebase/app";
import { getFirestore, or } from "firebase/firestore";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  where,
  startAfter,
} from "firebase/firestore";
import { Transaction } from "../types";
import { Block } from "../types";
import { getCountFromServer } from "firebase/firestore";
import {
  normalizeAddress,
  resolvesFromNonUsers,
} from "./address";
import { calculateBlockNumber } from "@/src/services/dfschain-information";

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
export const FIRST_BLOCK_TIME = "2025-06-28T00:00:00Z";


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
  const normalized = address.trim().toLowerCase();

  async function queryByField(
    field: string,
    value: string,
    useOrderBy: boolean,
    op: "==" | "array-contains" = "=="
  ): Promise<Transaction[]> {
    try {
      const snapshot = useOrderBy
        ? await getDocs(
            query(
              collection(db, "transactions"),
              where(field, op, value),
              orderBy("createdAt", "desc")
            )
          )
        : await getDocs(
            query(collection(db, "transactions"), where(field, op, value))
          );
      return snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
      })) as Transaction[];
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (
        useOrderBy &&
        (err?.code === "failed-precondition" ||
          err?.message?.includes("index"))
      ) {
        return queryByField(field, value, false, op);
      }
      console.warn(`Transaction query failed (${field})`, error);
      return [];
    }
  }

  const [fromTransactions, toTransactions, relatedTransactions] =
    await Promise.all([
      queryByField("fromAddress", normalized, true),
      queryByField("toAddress", normalized, true),
      queryByField("relatedAddresses", normalized, true, "array-contains"),
    ]);

  const merged = new Map<string, Transaction>();
  for (const tx of [
    ...fromTransactions,
    ...toTransactions,
    ...relatedTransactions,
  ]) {
    const key = tx.transactionHash || `${tx.fromAddress}-${tx.toAddress}-${tx.createdAt?.getTime?.() ?? 0}`;
    merged.set(key, tx);
  }

  return Array.from(merged.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getTransactionsByAddressWithLimitWithTotalCount(
  address: string,
  limitNumber: number
): Promise<{ transactions: Transaction[]; totalCount: number }> {
  const normalized = address.trim().toLowerCase();
  const allTransactions = await getTransactionsByAddress(normalized);

  return {
    transactions: allTransactions.slice(0, limitNumber),
    totalCount: allTransactions.length,
  };
}

async function queryWalletByAddress(
  collectionName: "users" | "non_users",
  walletAddress: string
) {
  const variants = Array.from(
    new Set([walletAddress.trim(), walletAddress.trim().toLowerCase()])
  ).filter(Boolean);

  for (const w of variants) {
    const snapshot = await getDocs(
      query(
        collection(db, collectionName),
        where("walletAddress", "==", w),
        limit(1)
      )
    );

    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
  }

  for (const w of variants) {
    const directDoc = await getDoc(doc(db, collectionName, w));
    if (directDoc.exists()) {
      return directDoc.data();
    }
  }

  return null;
}

/** Resolve wallet or contract balances from `users` / `non_users`. */
async function resolveWalletData(address: string) {
  const walletAddress = normalizeAddress(address);

  if (resolvesFromNonUsers(walletAddress)) {
    return queryWalletByAddress("non_users", walletAddress);
  }

  const userData = await queryWalletByAddress("users", walletAddress);
  if (userData) return userData;

  return queryWalletByAddress("non_users", walletAddress);
}

export async function getNativeBalance(address: string): Promise<string> {
  const walletData = await resolveWalletData(address);
  if (!walletData) {
    return "0";
  }

  return String(walletData.nativeTokenBalance ?? "0");
}

export async function getUserTokens(address: string): Promise<any[]> {
  const walletData = await resolveWalletData(address);
  if (!walletData) {
    return [];
  }

  return walletData.tokens || [];
}

/** Prefer server-side admin read (works when client Firestore rules block `users`). */
export async function getWalletBalances(
  address: string
): Promise<{ balance: string; tokens: any[] }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(
        `/api/wallet-balance?address=${encodeURIComponent(address)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.adminConfigured !== false) {
          return {
            balance: String(data.nativeTokenBalance ?? "0"),
            tokens: Array.isArray(data.tokens) ? data.tokens : [],
          };
        }
      }
    } catch (error) {
      console.warn("Wallet balance API unavailable, using client Firestore", error);
    }
  }

  const [balance, tokens] = await Promise.all([
    getNativeBalance(address),
    getUserTokens(address),
  ]);
  return { balance, tokens };
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
  const normalized = normalizeAddress(tokenAddress);

  const [usersSnapshot, nonUsersSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, "users"),
        where("tokenHoldings", "array-contains", normalized)
      )
    ),
    getDocs(
      query(
        collection(db, "non_users"),
        where("tokenHoldings", "array-contains", normalized)
      )
    ),
  ]);

  return [
    ...usersSnapshot.docs.map((docSnap) => docSnap.data()),
    ...nonUsersSnapshot.docs.map((docSnap) => docSnap.data()),
  ];
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
  try {
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
  } catch (error: any) {
    // If index error, try without orderBy as fallback
    if (error?.code === "failed-precondition" || error?.message?.includes("index")) {
      console.warn("Firestore index required. Falling back to query without orderBy. Please create the index:", error.message);
      
      const txQuery = query(
        collection(db, "transactions"),
        where("token.tokenAddress", "==", tokenAddress),
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

      // Sort manually as fallback
      transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        transactions: transactions.slice(0, limitNumber),
        totalCount: countSnapshot.data().count,
      };
    }
    throw error;
  }
}

// Fetch tokens with web3TokenAddress
export async function getTokensWithWeb3Address(limitCount: number = 10) {
  // Firestore doesn't support != null queries directly, so we fetch all and filter
  const tokensQuery = query(
    collection(db, "tokens"),
    limit(100) // Fetch more to filter, adjust as needed
  );

  const snapshot = await getDocs(tokensQuery);
  const tokens = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((token: any) => token.web3TokenAddress && token.web3TokenAddress.trim() !== "")
    .slice(0, limitCount);
  
  return tokens;
}