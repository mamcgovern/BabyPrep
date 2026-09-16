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

const TaskContext = createContext(null);

const starterTasks = [
  {
    id: 'starter-health-check',
    title: 'Schedule a preconception health appointment',
    description:
      'Talk through overall health, medications, vitamins, and anything we should know before trying.',
    phase: 'Before Trying',
    assignedTo: 'Maddie',
    status: 'Not Started',
    priority: 'High',
  },
  {
    id: 'starter-prenatal-vitamin',
    title: 'Research prenatal vitamins',
    description:
      'Compare options and decide what we want to take before trying.',
    phase: 'Before Trying',
    assignedTo: 'Maddie',
    status: 'Not Started',
    priority: 'Medium',
  },
  {
    id: 'starter-finances',
    title: 'Review our finances',
    description:
      'Look at savings, monthly expenses, insurance, and what we want to have set aside.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    status: 'Not Started',
    priority: 'High',
  },
  {
    id: 'starter-childcare',
    title: 'Research childcare options',
    description:
      'Learn about daycare, waitlists, costs, availability, and what options are near us.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    status: 'Not Started',
    priority: 'High',
  },
  {
    id: 'starter-parenting-books',
    title: 'Choose a few parenting books to read',
    description:
      'Find books that cover pregnancy, newborn care, parenting approaches, and what to expect.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    status: 'Not Started',
    priority: 'Low',
  },
  {
    id: 'starter-insurance',
    title: 'Understand our health insurance',
    description:
      'Review maternity coverage, deductibles, out-of-pocket maximums, and adding a baby.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    status: 'Not Started',
    priority: 'Medium',
  },
  {
    id: 'starter-work-benefits',
    title: 'Review parental leave and work benefits',
    description:
      'Figure out parental leave, FMLA, short-term disability, and other available benefits.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    status: 'Not Started',
    priority: 'Medium',
  },
];

const tasksCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'tasks'
);

const settingsRef = doc(
  db,
  'families',
  FAMILY_ID,
  'settings',
  'app'
);

async function seedStarterTasks() {
  const settingsSnapshot = await getDoc(settingsRef);

  if (
    settingsSnapshot.exists() &&
    settingsSnapshot.data().tasksSeeded
  ) {
    return;
  }

  await Promise.all(
    starterTasks.map(({ id, ...task }) =>
      setDoc(doc(tasksCollection, id), {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    )
  );

  await setDoc(
    settingsRef,
    {
      tasksSeeded: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function sortTasks(taskList) {
  return [...taskList].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return aTime - bTime;
  });
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe;

    const initializeTasks = async () => {
      try {
        const settingsSnapshot = await getDoc(settingsRef);

        if (
          !settingsSnapshot.exists() ||
          !settingsSnapshot.data().tasksSeeded
        ) {
          await seedStarterTasks();
        }

        unsubscribe = onSnapshot(
          tasksCollection,
          (snapshot) => {
            const loadedTasks = snapshot.docs.map((taskDoc) => ({
              id: taskDoc.id,
              ...taskDoc.data(),
            }));

            setTasks(sortTasks(loadedTasks));
            setLoading(false);
            setError('');
          },
          (snapshotError) => {
            console.error('Error loading tasks:', snapshotError);
            setLoading(false);
            setError('We could not load your tasks.');
          }
        );
      } catch (initializationError) {
        console.error(
          'Error initializing tasks:',
          initializationError
        );
        setLoading(false);
        setError('We could not load your tasks.');
      }
    };

    initializeTasks();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const addTask = async (taskData) => {
    try {
      await addDoc(tasksCollection, {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (addError) {
      console.error('Error adding task:', addError);
      throw addError;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      await updateDoc(doc(tasksCollection, taskId), {
        ...taskData,
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error('Error updating task:', updateError);
      throw updateError;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(tasksCollection, taskId));
    } catch (deleteError) {
      console.error('Error deleting task:', deleteError);
      throw deleteError;
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    const newStatus =
      task.status === 'Complete' ? 'Not Started' : 'Complete';

    await updateDoc(doc(tasksCollection, taskId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const changeTaskStatus = async (taskId, status) => {
    try {
      await updateDoc(doc(tasksCollection, taskId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (statusError) {
      console.error('Error changing task status:', statusError);
      throw statusError;
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;

    const complete = tasks.filter(
      (task) => task.status === 'Complete'
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === 'In Progress'
    ).length;

    const notStarted = tasks.filter(
      (task) => task.status === 'Not Started'
    ).length;

    const percentage =
      total === 0 ? 0 : Math.round((complete / total) * 100);

    return {
      total,
      complete,
      inProgress,
      notStarted,
      percentage,
    };
  }, [tasks]);

  const value = {
    tasks,
    stats,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    changeTaskStatus,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTasks must be used inside a TaskProvider');
  }

  return context;
}