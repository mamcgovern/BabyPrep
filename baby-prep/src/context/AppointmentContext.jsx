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

const AppointmentContext = createContext(null);

const appointmentCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'appointments'
);

export const appointmentTypes = [
  'Healthcare',
  'Childcare',
  'Class',
  'Hospital / Birth Center',
  'Tour',
  'Other',
];

export const appointmentStatuses = [
  'Upcoming',
  'Completed',
  'Cancelled',
];

function sortAppointments(items) {
  return [...items].sort((a, b) => {
    const aDate = a.date || '';
    const bDate = b.date || '';

    if (aDate !== bDate) {
      return aDate.localeCompare(bDate);
    }

    return (a.time || '').localeCompare(b.time || '');
  });
}

export function AppointmentProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      appointmentCollection,
      (snapshot) => {
        const loadedItems = snapshot.docs.map((appointmentDoc) => ({
          id: appointmentDoc.id,
          ...appointmentDoc.data(),
        }));

        setItems(sortAppointments(loadedItems));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Error loading appointments:', snapshotError);
        setLoading(false);
        setError('We could not load your appointments.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addAppointment = async (appointmentData) => {
    const appointmentRef = await addDoc(appointmentCollection, {
      title: appointmentData.title || '',
      type: appointmentData.type || 'Other',
      date: appointmentData.date || '',
      time: appointmentData.time || '',
      location: appointmentData.location || '',
      cost:
        appointmentData.cost == null || appointmentData.cost === ''
          ? null
          : Number(appointmentData.cost),
      link: appointmentData.link || '',
      notes: appointmentData.notes || '',
      status: appointmentData.status || 'Upcoming',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return appointmentRef.id;
  };

  const updateAppointment = async (appointmentId, appointmentData) => {
    await updateDoc(doc(appointmentCollection, appointmentId), {
      ...appointmentData,
      cost:
        appointmentData.cost == null || appointmentData.cost === ''
          ? null
          : Number(appointmentData.cost),
      updatedAt: serverTimestamp(),
    });
  };

  const deleteAppointment = async (appointmentId) => {
    await deleteDoc(doc(appointmentCollection, appointmentId));
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    return {
      total: items.length,
      upcoming: items.filter(
        (item) =>
          item.status === 'Upcoming' &&
          (!item.date || item.date >= today)
      ).length,
      thisMonth: items.filter(
        (item) =>
          item.status === 'Upcoming' &&
          item.date?.startsWith(currentMonth)
      ).length,
      classes: items.filter(
        (item) =>
          item.status === 'Upcoming' &&
          item.type === 'Class'
      ).length,
      tours: items.filter(
        (item) =>
          item.status === 'Upcoming' &&
          item.type === 'Tour'
      ).length,
    };
  }, [items]);

  return (
    <AppointmentContext.Provider
      value={{
        items,
        stats,
        loading,
        error,
        addAppointment,
        updateAppointment,
        deleteAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);

  if (!context) {
    throw new Error(
      'useAppointments must be used inside an AppointmentProvider'
    );
  }

  return context;
}