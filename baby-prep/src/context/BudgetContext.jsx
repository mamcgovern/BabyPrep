import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  'Feeding',
  'Diapering',
  'Healthcare',
  'Childcare',
  'Classes & Education',
  'Birth',
  'Other',
];

export const budgetStatuses = [
  'Planned',
  'Purchased',
  'Skipped',
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
    const budgetRef = await addDoc(budgetCollection, {
      name: budgetData.name || '',
      category: budgetData.category || 'Other',
      plannedAmount: Number(budgetData.plannedAmount) || 0,
      actualAmount: Number(budgetData.actualAmount) || 0,
      status: budgetData.status || 'Planned',
      notes: budgetData.notes || '',
      sourceType: budgetData.sourceType || 'manual',
      sourceId: budgetData.sourceId || null,
      sourceName: budgetData.sourceName || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return budgetRef.id;
  };

  const addBudgetItemFromBabyGear = async (gearItem) => {
    return addBudgetItem({
      name: gearItem.name,
      category: 'Baby Gear',
      plannedAmount: Number(gearItem.price) || 0,
      actualAmount: 0,
      status: 'Planned',
      notes: '',
      sourceType: 'babyGear',
      sourceId: gearItem.id,
      sourceName: gearItem.name,
    });
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

  const detachBudgetSource = async (budgetId) => {
    await updateBudgetItem(budgetId, {
      sourceType: 'manual',
      sourceId: null,
    });
  };

  const getBudgetItem = useCallback(
    (budgetId) => {
      return items.find((item) => item.id === budgetId) || null;
    },
    [items]
  );

  const getBudgetItemForSource = useCallback(
    (sourceType, sourceId) => {
      return (
        items.find(
          (item) =>
            item.sourceType === sourceType &&
            item.sourceId === sourceId
        ) || null
      );
    },
    [items]
  );

  const stats = useMemo(() => {
    const activeItems = items.filter((item) => item.status !== 'Skipped');

    const planned = activeItems.reduce(
      (total, item) => total + (Number(item.plannedAmount) || 0),
      0
    );

    const spent = items.reduce(
      (total, item) => total + (Number(item.actualAmount) || 0),
      0
    );

    return {
      total: items.length,
      planned,
      spent,
      remaining: planned - spent,
      purchased: items.filter((item) => item.status === 'Purchased').length,
      skipped: items.filter((item) => item.status === 'Skipped').length,
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
        addBudgetItemFromBabyGear,
        updateBudgetItem,
        deleteBudgetItem,
        detachBudgetSource,
        getBudgetItem,
        getBudgetItemForSource,
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