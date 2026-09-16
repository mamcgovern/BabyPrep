import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../services/firebase';
import { FAMILY_ID } from '../config/baby';

const TaskContext = createContext(null);

const initialTasks = [
  {
    title: 'Talk about when we want to start trying',
    description:
      'Talk through timing, goals, and anything we want to have in place first.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    dueDate: '',
    priority: 'High',
    status: 'Not Started',
  },
  {
    title: 'Research prenatal vitamins',
    description:
      'Look into options and talk about what we want to take before trying.',
    phase: 'Before Trying',
    assignedTo: 'Maddie',
    dueDate: '',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    title: 'Review health insurance coverage',
    description:
      'Understand prenatal, delivery, hospital, and newborn coverage.',
    phase: 'Before Trying',
    assignedTo: 'Nick',
    dueDate: '',
    priority: 'High',
    status: 'Not Started',
  },
  {
    title: 'Start researching childcare options',
    description:
      'Make a list of daycares, in-home options, family care, and waitlist requirements.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    dueDate: '',
    priority: 'High',
    status: 'Not Started',
  },
  {
    title: 'Make a preliminary baby budget',
    description:
      'Estimate one-time purchases, monthly costs, childcare, and savings goals.',
    phase: 'Before Trying',
    assignedTo: 'Both',
    dueDate: '',
    priority: 'Medium',
    status: 'Not Started',
  },
  {
    title: 'Make a list of questions for our doctors',
    description:
      'Write down anything we want to ask before we start trying.',
    phase: 'Trying to Conceive',
    assignedTo: 'Both',
    dueDate: '',
    priority: 'Medium',
    status: 'Not Started',
  },
  {
    title: 'Research early pregnancy resources',
    description:
      'Find books, apps, classes, and trustworthy websites we want to use.',
    phase: 'Pregnancy Prep',
    assignedTo: 'Both',
    dueDate: '',
    priority: 'Low',
    status: 'Not Started',
  },
];

const tasksCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'tasks'
);

function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const tasksQuery = query(
      tasksCollection,
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);

            initialTasks.forEach((task) => {
              const taskRef = doc(tasksCollection);

              batch.set(taskRef, {
                ...task,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            });

            await batch.commit();
            return;
          } catch (firebaseError) {
            console.error('Error creating starter tasks:', firebaseError);
            setError('We couldn’t create your starter tasks.');
            setLoading(false);
            return;
          }
        }

        const loadedTasks = snapshot.docs.map((taskDocument) => ({
          id: taskDocument.id,
          ...taskDocument.data(),
        }));

        setTasks(loadedTasks);
        setError('');
        setLoading(false);
      },
      (firebaseError) => {
        console.error('Error loading tasks:', firebaseError);
        setError('We couldn’t load your tasks.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addTask = async (taskData) => {
    try {
      setError('');

      await addDoc(tasksCollection, {
        ...taskData,
        status: taskData.status || 'Not Started',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (firebaseError) {
      console.error('Error adding task:', firebaseError);
      setError('We couldn’t add that task.');
      throw firebaseError;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      setError('');

      await updateDoc(doc(tasksCollection, taskId), {
        ...taskData,
        updatedAt: serverTimestamp(),
      });
    } catch (firebaseError) {
      console.error('Error updating task:', firebaseError);
      setError('We couldn’t update that task.');
      throw firebaseError;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError('');

      await deleteDoc(doc(tasksCollection, taskId));
    } catch (firebaseError) {
      console.error('Error deleting task:', firebaseError);
      setError('We couldn’t delete that task.');
      throw firebaseError;
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      return;
    }

    const newStatus =
      task.status === 'Complete'
        ? 'Not Started'
        : 'Complete';

    await updateTask(taskId, {
      status: newStatus,
    });
  };

  const changeTaskStatus = async (taskId, status) => {
    await updateTask(taskId, {
      status,
    });
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

    return {
      total,
      complete,
      inProgress,
      notStarted,
      percentage: total
        ? Math.round((complete / total) * 100)
        : 0,
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

function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTasks must be used inside a TaskProvider');
  }

  return context;
}

export { TaskProvider, useTasks };