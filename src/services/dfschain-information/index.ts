import { BLOCK_GENERATION_TIME, FIRST_BLOCK_TIME } from "@/src/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getCountFromServer,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export async function getDfsBaseFee() {
  // TODO: need to calculate to be $0.01 based on the web3 token price by sync in the future
  return 0.01; // $0.01
}

export async function getDfsCirculationSupply() {
  // TODO: cuirculation supply should be provided by Token foundation
  return 100000000;
}

export async function getHoldersCount(tokenAddress: string) {
  try {
    const tokenHolderDoc = doc(
      collection(db, "token_holder_count"),
      tokenAddress
    );
    const docSnapshot = await getDoc(tokenHolderDoc);

    if (docSnapshot.exists()) {
      return docSnapshot.data().count || 0;
    }

    return 0;
  } catch (error) {
    console.error("Error getting holders count:", error);
    return 0;
  }
}

export function calculateBlockNumber() {
  try {
    const currentTimestamp = new Date();
    const blockNumber = Math.floor(
      (currentTimestamp.getTime() - new Date(FIRST_BLOCK_TIME).getTime()) /
        BLOCK_GENERATION_TIME
    );
    return blockNumber;
  } catch (error) {
    console.error("Error calculating block number:", error);
    return 0;
  }
}

export async function getTwoWeekTransactionHistory(): Promise<
  { date: string; count: number }[]
> {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);

  // Query for transactions within the last 14 days
  const txQuery = query(
    collection(db, "transactions"),
    where("createdAt", ">=", twoWeeksAgo),
    orderBy("createdAt", "desc")
  );

  const txSnapshot = await getDocs(txQuery);
  const transactions = txSnapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));

  // Create a map to store daily counts
  const dailyCounts = new Map<string, number>();

  // Initialize the map with all dates in the range
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    dailyCounts.set(dateString, 0);
  }

  // Count transactions for each day
  transactions.forEach((tx) => {
    const dateString = tx.createdAt.toISOString().split("T")[0];
    if (dailyCounts.has(dateString)) {
      dailyCounts.set(dateString, (dailyCounts.get(dateString) || 0) + 1);
    }
  });

  // Convert map to array and sort by date (newest first)
  const result = Array.from(dailyCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return result;
}

export async function getDfsTransactionCount(duration: string) {
  try {
    let txQuery = query(collection(db, "transactions"));
    let orderByClause = orderBy("createdAt", "desc");

    const today = new Date();
    const startDate = new Date(today);
    if (duration === "all") {
      txQuery = query(collection(db, "transactions"), orderByClause);
    } else {
      if (duration === "1d") {
        startDate.setDate(today.getDate() - 1);
      } else if (duration === "7d") {
        startDate.setDate(today.getDate() - 7);
      } else if (duration === "30d") {
        startDate.setDate(today.getDate() - 30);
      } else if (duration === "90d") {
        startDate.setDate(today.getDate() - 90);
      } else if (duration === "180d") {
        startDate.setDate(today.getDate() - 180);
      } else {
        startDate.setDate(today.getDate() - 360);
      }

      txQuery = query(
        collection(db, "transactions"),
        where("createdAt", ">=", startDate),
        orderByClause
      );
    }

    const txCount = await getCountFromServer(txQuery);

    return txCount.data().count;
  } catch (error) {
    console.error("Error getting DFS transaction count:", error);
    return 0;
  }
}
