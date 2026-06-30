import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Transaction {
  id?: string;
  userId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date?: any;
  icon: string;
}

export const addTransaction = async (userId: string, title: string, amount: number, type: 'income' | 'expense', icon: string) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      userId,
      title,
      amount,
      type,
      icon,
      date: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

import { writeBatch, doc } from 'firebase/firestore';

export const sendP2PMoney = async (senderId: string, recipientId: string, amount: number, memo: string, senderName: string, recipientName: string) => {
  try {
    const batch = writeBatch(db);
    
    // 1. Sender Expense Transaction
    const senderTxRef = doc(collection(db, 'transactions'));
    batch.set(senderTxRef, {
      userId: senderId,
      title: `Paid ${recipientName}: ${memo}`,
      amount: amount,
      type: 'expense',
      icon: '💸',
      date: serverTimestamp()
    });

    // 2. Recipient Income Transaction
    const recipientTxRef = doc(collection(db, 'transactions'));
    batch.set(recipientTxRef, {
      userId: recipientId,
      title: `From ${senderName}: ${memo}`,
      amount: amount,
      type: 'income',
      icon: '💰',
      date: serverTimestamp()
    });

    await batch.commit();
  } catch (e) {
    console.error("Error in P2P transaction: ", e);
    throw e;
  }
};

export const subscribeToUserTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, 'transactions'),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    callback(transactions);
  });
};

export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);
};
