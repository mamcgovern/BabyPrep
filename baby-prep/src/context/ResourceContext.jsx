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

const ResourceContext = createContext(null);

const resourcesCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'resources'
);

const starterResources = [
  {
    title: 'What to Expect Before You’re Expecting',
    type: 'Book',
    topic: 'Before Trying',
    assignedTo: 'Both',
    status: 'Want to Read',
    favorite: false,
    maddieRating: null,
    nickRating: null,
    notes: '',
  },
  {
    title: 'Expecting Better',
    type: 'Book',
    topic: 'Pregnancy',
    assignedTo: 'Both',
    status: 'Want to Read',
    favorite: false,
    maddieRating: null,
    nickRating: null,
    notes: '',
  },
  {
    title: 'The Birth Partner',
    type: 'Book',
    topic: 'Birth',
    assignedTo: 'Both',
    status: 'Want to Read',
    favorite: false,
    maddieRating: null,
    nickRating: null,
    notes: '',
  },
  {
    title: 'Cribsheet',
    type: 'Book',
    topic: 'Parenting',
    assignedTo: 'Both',
    status: 'Want to Read',
    favorite: false,
    maddieRating: null,
    nickRating: null,
    notes: '',
  },
];

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
    const unsubscribe = onSnapshot(
      resourcesCollection,
      (snapshot) => {
        const loadedResources = snapshot.docs.map((resourceDoc) => ({
          id: resourceDoc.id,
          ...resourceDoc.data(),
        }));

        if (loadedResources.length === 0) {
          Promise.all(
            starterResources.map((resource) =>
              addDoc(resourcesCollection, {
                ...resource,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
            )
          ).catch((seedError) => {
            console.error('Error adding starter resources:', seedError);
          });
        }

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

    return unsubscribe;
  }, []);

  const addResource = async (resourceData) => {
    await addDoc(resourcesCollection, {
      ...resourceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateResource = async (resourceId, resourceData) => {
    await updateDoc(doc(resourcesCollection, resourceId), {
      ...resourceData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteResource = async (resourceId) => {
    await deleteDoc(doc(resourcesCollection, resourceId));
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