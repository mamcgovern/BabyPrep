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
  'Clothing',
  'Diapering',
  'Feeding',
  'Childcare',
  'Medical',
  'Classes & Education',
  'Appointments',
  'Other',
];

export const budgetStatuses = [
  'Planned',
  'Purchased',
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
        console.error('Error loading budget:', snapshotError);
        setLoading(false);
        setError('We could not load your budget.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addBudgetItem = async (budgetData) => {
    const budgetDoc = await addDoc(budgetCollection, {
      name: budgetData.name || '',
      category: budgetData.category || 'Other',
      plannedAmount: Number(budgetData.plannedAmount) || 0,
      actualAmount:
        budgetData.actualAmount === '' ||
        budgetData.actualAmount == null
          ? null
          : Number(budgetData.actualAmount),
      status: budgetData.status || 'Planned',
      notes: budgetData.notes || '',
      sourceType: budgetData.sourceType || 'manual',
      sourceId: budgetData.sourceId || null,
      sourceName: budgetData.sourceName || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return budgetDoc.id;
  };

  const updateBudgetItem = async (budgetId, budgetData) => {
    await updateDoc(doc(budgetCollection, budgetId), {
      ...budgetData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteBudgetItem = async (budgetId) => {
    await deleteDoc(doc(budgetCollection, budgetId));
  };

  const addFromBabyGear = async (gearItem) => {
    if (!gearItem?.id) {
      throw new Error('Baby gear item is missing an ID.');
    }

    if (gearItem.budgetItemId) {
      return gearItem.budgetItemId;
    }

    const budgetId = await addBudgetItem({
      name: gearItem.name,
      category: 'Baby Gear',
      plannedAmount: gearItem.price,
      actualAmount: null,
      status: 'Planned',
      notes: gearItem.notes || '',
      sourceType: 'babyGear',
      sourceId: gearItem.id,
      sourceName: gearItem.name,
    });

    return budgetId;
  };

  const totals = useMemo(() => {
    const planned = items.reduce(
      (total, item) => total + (Number(item.plannedAmount) || 0),
      0
    );

    const actual = items.reduce(
      (total, item) => total + (Number(item.actualAmount) || 0),
      0
    );

    const remaining = Math.max(planned - actual, 0);

    return {
      planned,
      actual,
      remaining,
    };
  }, [items]);

  const stats = useMemo(() => ({
    total: items.length,
    planned: items.filter((item) => item.status !== 'Purchased').length,
    purchased: items.filter((item) => item.status === 'Purchased').length,
    fromBabyGear: items.filter((item) => item.sourceType === 'babyGear').length,
  }), [items]);

  return (
    <BudgetContext.Provider
      value={{
        items,
        totals,
        stats,
        loading,
        error,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addFromBabyGear,
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