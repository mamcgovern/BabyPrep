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
import { useBudget } from './BudgetContext';

const BabyGearContext = createContext(null);

const gearCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'babyGear'
);

function sortGear(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

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

export function BabyGearProvider({ children }) {
  const { addFromBabyGear, updateBudgetItem, deleteBudgetItem } = useBudget();

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
    const gearDoc = await addDoc(gearCollection, {
      ...gearData,
      price:
        gearData.price === '' || gearData.price == null
          ? null
          : Number(gearData.price),
      budgetItemId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return gearDoc.id;
  };

  const updateGear = async (gearId, gearData) => {
    const existingItem = items.find((item) => item.id === gearId);

    const updatedPrice =
      gearData.price === '' || gearData.price == null
        ? null
        : Number(gearData.price);

    await updateDoc(doc(gearCollection, gearId), {
      ...gearData,
      price: updatedPrice,
      updatedAt: serverTimestamp(),
    });

    if (existingItem?.budgetItemId) {
      await updateBudgetItem(existingItem.budgetItemId, {
        plannedAmount: updatedPrice || 0,
        name: gearData.name || existingItem.name,
        sourceName: gearData.name || existingItem.name,
      });
    }
  };

  const addToBudget = async (gearItem) => {
    if (gearItem.budgetItemId) {
      return gearItem.budgetItemId;
    }

    const budgetItemId = await addFromBabyGear(gearItem);

    await updateDoc(doc(gearCollection, gearItem.id), {
      budgetItemId,
      updatedAt: serverTimestamp(),
    });

    return budgetItemId;
  };

  const removeFromBudget = async (gearItem) => {
    if (!gearItem?.budgetItemId) {
      return;
    }

    await deleteBudgetItem(gearItem.budgetItemId);

    await updateDoc(doc(gearCollection, gearItem.id), {
      budgetItemId: null,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteGear = async (gearId, deleteConnectedBudget = false) => {
    const existingItem = items.find((item) => item.id === gearId);

    if (deleteConnectedBudget && existingItem?.budgetItemId) {
      await deleteBudgetItem(existingItem.budgetItemId);
    }

    await deleteDoc(doc(gearCollection, gearId));
  };

  const stats = useMemo(() => ({
    total: items.length,
    researching: items.filter((item) => item.status === 'Researching').length,
    considering: items.filter((item) => item.status === 'Considering').length,
    decided: items.filter((item) => item.status === 'Decided').length,
  }), [items]);

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
        addToBudget,
        removeFromBudget,
      }}
    >
      {children}
    </BabyGearContext.Provider>
  );
}

export function useBabyGear() {
  const context = useContext(BabyGearContext);

  if (!context) {
    throw new Error('useBabyGear must be used inside a BabyGearProvider');
  }

  return context;
}