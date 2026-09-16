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
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { db } from '../services/firebase';
import { FAMILY_ID } from '../config/baby';
import { useBudget } from './BudgetContext';

const BabyGearContext = createContext(null);

const gearCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'babyGear'
);

export const gearCategories = [
  'Strollers',
  'Car Seats',
  'Cribs & Bassinets',
  'Baby Monitors',
  'High Chairs',
  'Carriers',
  'Diapering',
  'Feeding',
  'Bath & Health',
  'Nursery Furniture',
  'Clothing',
  'Toys',
  'Other',
];

export const gearStatuses = [
  'Researching',
  'Considering',
  'Decided',
  "Don't Want",
];

function sortGear(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

export function BabyGearProvider({ children }) {
  const {
    addBudgetItemFromBabyGear,
    updateBudgetItem,
    deleteBudgetItem,
    detachBudgetSource,
    getBudgetItem,
  } = useBudget();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      gearCollection,
      (snapshot) => {
        const loadedItems = snapshot.docs.map((gearDoc) => ({
          id: gearDoc.id,
          ...gearDoc.data(),
        }));

        setItems(sortGear(loadedItems));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Error loading baby gear:', snapshotError);
        setLoading(false);
        setError('We could not load your baby gear.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addGear = async (gearData) => {
    const gearRef = await addDoc(gearCollection, {
      ...gearData,
      budgetItemId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return gearRef.id;
  };

  const updateGear = async (gearId, gearData) => {
    const currentItem = items.find((item) => item.id === gearId);

    await updateDoc(doc(gearCollection, gearId), {
      ...gearData,
      updatedAt: serverTimestamp(),
    });

    if (
      currentItem?.budgetItemId &&
      gearData.price !== undefined &&
      Number(gearData.price) !== Number(currentItem.price)
    ) {
      const budgetItem = getBudgetItem(currentItem.budgetItemId);

      if (budgetItem) {
        await updateBudgetItem(currentItem.budgetItemId, {
          plannedAmount: Number(gearData.price) || 0,
          sourceName: gearData.name || currentItem.name,
        });
      }
    }

    if (
      currentItem?.budgetItemId &&
      gearData.name &&
      gearData.name !== currentItem.name
    ) {
      const budgetItem = getBudgetItem(currentItem.budgetItemId);

      if (budgetItem) {
        await updateBudgetItem(currentItem.budgetItemId, {
          name: gearData.name,
          sourceName: gearData.name,
        });
      }
    }
  };

  const deleteGear = async (gearId) => {
    const currentItem = items.find((item) => item.id === gearId);

    if (currentItem?.budgetItemId) {
      const budgetItem = getBudgetItem(currentItem.budgetItemId);

      if (budgetItem) {
        const actualAmount = Number(budgetItem.actualAmount) || 0;

        if (actualAmount > 0) {
          await detachBudgetSource(currentItem.budgetItemId);
        } else {
          await deleteBudgetItem(currentItem.budgetItemId);
        }
      }
    }

    await deleteDoc(doc(gearCollection, gearId));
  };

  const addGearToBudget = async (gearId) => {
    const gearItem = items.find((item) => item.id === gearId);

    if (!gearItem) {
      throw new Error('We could not find that baby gear item.');
    }

    if (gearItem.budgetItemId) {
      const existingBudgetItem = getBudgetItem(gearItem.budgetItemId);

      if (existingBudgetItem) {
        return existingBudgetItem.id;
      }
    }

    const price = Number(gearItem.price);

    if (Number.isNaN(price) || price < 0) {
      throw new Error(
        'Add a price to the baby gear item before adding it to your budget.'
      );
    }

    const budgetItemId = await addBudgetItemFromBabyGear(gearItem);

    await updateDoc(doc(gearCollection, gearId), {
      budgetItemId,
      updatedAt: serverTimestamp(),
    });

    return budgetItemId;
  };

  const removeGearFromBudget = async (gearId) => {
    const gearItem = items.find((item) => item.id === gearId);

    if (!gearItem?.budgetItemId) {
      return;
    }

    const budgetItem = getBudgetItem(gearItem.budgetItemId);

    if (budgetItem) {
      const actualAmount = Number(budgetItem.actualAmount) || 0;

      if (actualAmount > 0) {
        await detachBudgetSource(gearItem.budgetItemId);
      } else {
        await deleteBudgetItem(gearItem.budgetItemId);
      }
    }

    await updateDoc(doc(gearCollection, gearId), {
      budgetItemId: null,
      updatedAt: serverTimestamp(),
    });
  };

  const stats = useMemo(
    () => ({
      total: items.length,
      researching: items.filter(
        (item) => item.status === 'Researching'
      ).length,
      considering: items.filter(
        (item) => item.status === 'Considering'
      ).length,
      decided: items.filter(
        (item) => item.status === 'Decided'
      ).length,
      budgeted: items.filter((item) => {
        if (!item.budgetItemId) {
          return false;
        }

        return Boolean(getBudgetItem(item.budgetItemId));
      }).length,
    }),
    [items, getBudgetItem]
  );

  return (
    <BabyGearContext.Provider
      value={{
        items,
        stats,
        loading,
        error,
        addGear,
        updateGear,
        deleteGear,
        addGearToBudget,
        removeGearFromBudget,
        getBudgetItem,
      }}
    >
      {children}
    </BabyGearContext.Provider>
  );
}

export function useBabyGear() {
  const context = useContext(BabyGearContext);

  if (!context) {
    throw new Error(
      'useBabyGear must be used inside a BabyGearProvider'
    );
  }

  return context;
}