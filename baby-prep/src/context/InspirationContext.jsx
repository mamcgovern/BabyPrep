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

const InspirationContext = createContext(null);

const inspirationCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'inspiration'
);

function sortInspiration(items) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

export function InspirationProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      inspirationCollection,
      (snapshot) => {
        const loadedItems = snapshot.docs.map((inspirationDoc) => ({
          id: inspirationDoc.id,
          ...inspirationDoc.data(),
        }));

        setItems(sortInspiration(loadedItems));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Error loading inspiration:', snapshotError);
        setLoading(false);
        setError('We could not load your inspiration.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addInspiration = async (itemData) => {
    await addDoc(inspirationCollection, {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateInspiration = async (itemId, itemData) => {
    await updateDoc(doc(inspirationCollection, itemId), {
      ...itemData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteInspiration = async (itemId) => {
    await deleteDoc(doc(inspirationCollection, itemId));
  };

  const stats = useMemo(() => ({
    total: items.length,
    favorites: items.filter((item) => item.favorite).length,
    boards: new Set(items.map((item) => item.board)).size,
  }), [items]);

  return (
    <InspirationContext.Provider
      value={{
        items,
        stats,
        loading,
        error,
        addInspiration,
        updateInspiration,
        deleteInspiration,
      }}
    >
      {children}
    </InspirationContext.Provider>
  );
}

export function useInspiration() {
  const context = useContext(InspirationContext);

  if (!context) {
    throw new Error('useInspiration must be used inside an InspirationProvider');
  }

  return context;
}