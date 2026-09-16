import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../services/firebase';
import { FAMILY_ID } from '../config/baby';

const BudgetContext = createContext(null);

const budgetCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'budget'
);

export const budgetCategories = [
  'Baby Gear',
  'Nursery',
  'Medical',
  'Childcare',
  'Classes',
  'Clothing',
  'Feeding',
  'Diapering',
  'Work & Leave',
  'Miscellaneous',
];

export const budgetStatuses = [
  'Planning',
  'Purchased',
  'Paid',
  'Skip',
];

export const budgetPayers = [
  'Maddie',
  'Nick',
  'Shared',
];

function sortBudgetItems(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

export function BudgetProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      budgetCollection,
      (snapshot) => {
        const loadedItems = snapshot.docs.map((budgetDoc) => ({
          id: budgetDoc.id,
          ...budgetDoc.data(),
        }));

        setItems(sortBudgetItems(loadedItems));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Error loading budget items:', snapshotError);
        setLoading(false);
        setError('We could not load your budget.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addBudgetItem = async (itemData) => {
    await addDoc(budgetCollection, {
      ...itemData,
      plannedAmount: Number(itemData.plannedAmount) || 0,
      actualAmount: Number(itemData.actualAmount) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateBudgetItem = async (itemId, itemData) => {
    await updateDoc(doc(budgetCollection, itemId), {
      ...itemData,
      plannedAmount: Number(itemData.plannedAmount) || 0,
      actualAmount: Number(itemData.actualAmount) || 0,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteBudgetItem = async (itemId) => {
    await deleteDoc(doc(budgetCollection, itemId));
  };

  const stats = useMemo(() => {
    const planned = items.reduce(
      (total, item) => total + (Number(item.plannedAmount) || 0),
      0
    );

    const spent = items.reduce(
      (total, item) => total + (Number(item.actualAmount) || 0),
      0
    );

    return {
      planned,
      spent,
      remaining: planned - spent,
      items: items.length,
      purchased: items.filter(
        (item) => item.status === 'Purchased' || item.status === 'Paid'
      ).length,
    };
  }, [items]);

  return (
    <BudgetContext.Provider
      value={{
        items,
        stats,
        loading,
        error,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error('useBudget must be used inside a BudgetProvider');
  }

  return context;
}