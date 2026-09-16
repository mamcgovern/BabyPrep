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

const PlanningContext = createContext(null);

const planningCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'planning'
);

export const planningCategories = [
  'Childcare',
  'Work & Leave',
  'Feeding',
  'Birth',
  'Parenting',
  'Home & Lifestyle',
  'Finances',
  'Family & Support',
];

export const planningStatuses = [
  'Not Discussed',
  'Discussing',
  'Decided',
  'Revisit Later',
];

function sortPlanningItems(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

export function PlanningProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      planningCollection,
      (snapshot) => {
        const loadedItems = snapshot.docs.map((planningDoc) => ({
          id: planningDoc.id,
          ...planningDoc.data(),
        }));

        setItems(sortPlanningItems(loadedItems));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Error loading planning items:', snapshotError);
        setLoading(false);
        setError('We could not load your planning items.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addPlanningItem = async (itemData) => {
    await addDoc(planningCollection, {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updatePlanningItem = async (itemId, itemData) => {
    await updateDoc(doc(planningCollection, itemId), {
      ...itemData,
      updatedAt: serverTimestamp(),
    });
  };

  const deletePlanningItem = async (itemId) => {
    await deleteDoc(doc(planningCollection, itemId));
  };

  const stats = useMemo(() => ({
    total: items.length,
    notDiscussed: items.filter(
      (item) => item.status === 'Not Discussed'
    ).length,
    discussing: items.filter(
      (item) => item.status === 'Discussing'
    ).length,
    decided: items.filter(
      (item) => item.status === 'Decided'
    ).length,
    revisit: items.filter(
      (item) => item.status === 'Revisit Later'
    ).length,
  }), [items]);

  return (
    <PlanningContext.Provider
      value={{
        items,
        stats,
        loading,
        error,
        addPlanningItem,
        updatePlanningItem,
        deletePlanningItem,
      }}
    >
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning() {
  const context = useContext(PlanningContext);

  if (!context) {
    throw new Error('usePlanning must be used inside a PlanningProvider');
  }

  return context;
}