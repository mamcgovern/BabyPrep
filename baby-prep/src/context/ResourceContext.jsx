import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../services/firebase';
import { FAMILY_ID } from '../config/baby';

const ResourceContext = createContext(null);

const resourcesCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'resources'
);

const settingsRef = doc(
  db,
  'families',
  FAMILY_ID,
  'settings',
  'app'
);

function sortResources(resourceList) {
  return [...resourceList].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

export function ResourceProvider({ children }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe;

    const initializeResources = async () => {
      try {

        unsubscribe = onSnapshot(
          resourcesCollection,
          (snapshot) => {
            const loadedResources = snapshot.docs.map((resourceDoc) => ({
              id: resourceDoc.id,
              ...resourceDoc.data(),
            }));

            setResources(sortResources(loadedResources));
            setLoading(false);
            setError('');
          },
          (snapshotError) => {
            console.error('Error loading resources:', snapshotError);
            setLoading(false);
            setError('We could not load your resources.');
          }
        );
      } catch (initializationError) {
        console.error(
          'Error initializing resources:',
          initializationError
        );
        setLoading(false);
        setError('We could not load your resources.');
      }
    };

    initializeResources();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const addResource = async (resourceData) => {
    try {
      await addDoc(resourcesCollection, {
        ...resourceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (addError) {
      console.error('Error adding resource:', addError);
      throw addError;
    }
  };

  const updateResource = async (resourceId, resourceData) => {
    try {
      await updateDoc(doc(resourcesCollection, resourceId), {
        ...resourceData,
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error('Error updating resource:', updateError);
      throw updateError;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      await deleteDoc(doc(resourcesCollection, resourceId));
    } catch (deleteError) {
      console.error('Error deleting resource:', deleteError);
      throw deleteError;
    }
  };

  const stats = useMemo(() => {
    const total = resources.length;

    const completed = resources.filter(
      (resource) => resource.status === 'Finished'
    ).length;

    const inProgress = resources.filter(
      (resource) => resource.status === 'In Progress'
    ).length;

    const favorites = resources.filter(
      (resource) => resource.favorite
    ).length;

    return {
      total,
      completed,
      inProgress,
      favorites,
    };
  }, [resources]);

  return (
    <ResourceContext.Provider
      value={{
        resources,
        stats,
        loading,
        error,
        addResource,
        updateResource,
        deleteResource,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);

  if (!context) {
    throw new Error('useResources must be used inside a ResourceProvider');
  }

  return context;
}