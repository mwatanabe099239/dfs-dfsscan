import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore'
import { db } from './firebase'

// Get all transactions
export async function getTransactions(page = 1, perPage = 50) {
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef,
      orderBy('timestamp', 'desc'),
      limit(perPage)
    )
    
    const snapshot = await getDocs(q)
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return transactions
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

// Get transactions for a specific address
export async function getAddressTransactions(address: string, page = 1, perPage = 50) {
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef,
      where('from', '==', address.toLowerCase()),
      orderBy('timestamp', 'desc'),
      limit(perPage)
    )
    
    const snapshot = await getDocs(q)
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return transactions
  } catch (error) {
    console.error('Error fetching address transactions:', error)
    return []
  }
}

// Get network stats
export async function getNetworkStats() {
  try {
    const statsRef = collection(db, 'networkStats')
    const snapshot = await getDocs(statsRef)
    
    if (!snapshot.empty) {
      const statsDoc = snapshot.docs[0]
      return {
        id: statsDoc.id,
        ...statsDoc.data()
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching network stats:', error)
    return null
  }
} 