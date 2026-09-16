import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
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

const NameContext = createContext(null);

const namesCollection = collection(
  db,
  'families',
  FAMILY_ID,
  'names'
);

const settingsDocument = doc(
  db,
  'families',
  FAMILY_ID,
  'settings',
  'general'
);

export const nameGenders = [
  'Girl',
  'Boy',
  'Gender Neutral',
];

export const nameStatuses = [
  'New',
  'Considering',
  'Favorite',
  'Maybe',
  'No',
];

export const nameRatings = [
  'Love',
  'Like',
  'Maybe',
  'No Opinion',
  'No',
];

const defaultThemes = [
  'Tractor / Agriculture',
  'Racing',
  'Family / Honor Name',
  'Nature',
  'Vintage',
];

function normalizeThemes(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return [];
}

function sortNames(names) {
  return [...names].sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1;
    }

    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}

export function NameProvider({ children }) {
  const [names, setNames] = useState([]);
  const [themes, setThemes] = useState(defaultThemes);
  const [loading, setLoading] = useState(true);
  const [themesLoading, setThemesLoading] = useState(true);
  const [error, setError] = useState('');
  const [themesError, setThemesError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      namesCollection,
      (snapshot) => {
        const loadedNames = snapshot.docs.map((nameDoc) => {
          const data = nameDoc.data();

          return {
            id: nameDoc.id,
            ...data,
            themes: normalizeThemes(data.themes ?? data.theme),
          };
        });

        setNames(sortNames(loadedNames));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Error loading baby names:', snapshotError);
        setLoading(false);
        setError('We could not load your baby names.');
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      settingsDocument,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          if (Array.isArray(data.nameThemes)) {
            setThemes(data.nameThemes);
          } else {
            setThemes(defaultThemes);
          }
        } else {
          setThemes(defaultThemes);
        }

        setThemesLoading(false);
        setThemesError('');
      },
      (snapshotError) => {
        console.error('Error loading name themes:', snapshotError);
        setThemesLoading(false);
        setThemesError('We could not load your name themes.');
      }
    );

    return () => unsubscribe();
  }, []);

  const addName = async (nameData) => {
    const selectedThemes = normalizeThemes(
      nameData.themes ?? nameData.theme
    );

    const nameRef = await addDoc(namesCollection, {
      name: nameData.name || '',
      middleNames: Array.isArray(nameData.middleNames)
        ? nameData.middleNames
        : [],
      gender: nameData.gender || 'Gender Neutral',
      themes: selectedThemes,
      status: nameData.status || 'New',
      maddieRating: nameData.maddieRating || 'No Opinion',
      nickRating: nameData.nickRating || 'No Opinion',
      nicknames: Array.isArray(nameData.nicknames)
        ? nameData.nicknames
        : [],
      meaning: nameData.meaning || '',
      notes: nameData.notes || '',
      maddieNotes: nameData.maddieNotes || '',
      nickNotes: nameData.nickNotes || '',
      favorite: Boolean(nameData.favorite),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return nameRef.id;
  };

  const updateName = async (nameId, nameData) => {
    const updatedData = {
      ...nameData,
      themes: normalizeThemes(
        nameData.themes ?? nameData.theme
      ),
      updatedAt: serverTimestamp(),
    };

    delete updatedData.theme;

    await updateDoc(doc(namesCollection, nameId), updatedData);
  };

  const deleteName = async (nameId) => {
    await deleteDoc(doc(namesCollection, nameId));
  };

  const addTheme = async (themeName) => {
    const trimmedTheme = themeName.trim();

    if (!trimmedTheme) {
      throw new Error('Theme name cannot be empty.');
    }

    const normalizedTheme = trimmedTheme.toLowerCase();

    const alreadyExists = themes.some(
      (theme) => theme.toLowerCase() === normalizedTheme
    );

    if (alreadyExists) {
      throw new Error('A theme with that name already exists.');
    }

    const updatedThemes = [...themes, trimmedTheme];

    await setDoc(
      settingsDocument,
      {
        nameThemes: updatedThemes,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const updateTheme = async (oldTheme, newTheme) => {
    const trimmedTheme = newTheme.trim();

    if (!trimmedTheme) {
      throw new Error('Theme name cannot be empty.');
    }

    const normalizedTheme = trimmedTheme.toLowerCase();

    const duplicateTheme = themes.some(
      (theme) =>
        theme !== oldTheme &&
        theme.toLowerCase() === normalizedTheme
    );

    if (duplicateTheme) {
      throw new Error('A theme with that name already exists.');
    }

    const updatedThemes = themes.map((theme) =>
      theme === oldTheme ? trimmedTheme : theme
    );

    await setDoc(
      settingsDocument,
      {
        nameThemes: updatedThemes,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const namesUsingTheme = names.filter((name) =>
      normalizeThemes(name.themes ?? name.theme).includes(oldTheme)
    );

    await Promise.all(
      namesUsingTheme.map((name) => {
        const currentThemes = normalizeThemes(
          name.themes ?? name.theme
        );

        return updateDoc(doc(namesCollection, name.id), {
          themes: currentThemes.map((theme) =>
            theme === oldTheme ? trimmedTheme : theme
          ),
          updatedAt: serverTimestamp(),
        });
      })
    );
  };

  const deleteTheme = async (themeName) => {
    const updatedThemes = themes.filter(
      (theme) => theme !== themeName
    );

    await setDoc(
      settingsDocument,
      {
        nameThemes: updatedThemes,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const namesUsingTheme = names.filter((name) =>
      normalizeThemes(name.themes ?? name.theme).includes(themeName)
    );

    await Promise.all(
      namesUsingTheme.map((name) => {
        const currentThemes = normalizeThemes(
          name.themes ?? name.theme
        );

        return updateDoc(doc(namesCollection, name.id), {
          themes: currentThemes.filter(
            (theme) => theme !== themeName
          ),
          updatedAt: serverTimestamp(),
        });
      })
    );
  };

  const getName = (nameId) => {
    return names.find((name) => name.id === nameId) || null;
  };

  const stats = useMemo(() => {
    const activeNames = names.filter((name) => name.status !== 'No');

    return {
      total: names.length,
      active: activeNames.length,
      favorites: names.filter(
        (name) => name.favorite || name.status === 'Favorite'
      ).length,
      bothLike: names.filter(
        (name) =>
          name.maddieRating === 'Love' &&
          name.nickRating === 'Love'
      ).length,
      girls: activeNames.filter(
        (name) => name.gender === 'Girl'
      ).length,
      boys: activeNames.filter(
        (name) => name.gender === 'Boy'
      ).length,
      genderNeutral: activeNames.filter(
        (name) => name.gender === 'Gender Neutral'
      ).length,
    };
  }, [names]);

  return (
    <NameContext.Provider
      value={{
        names,
        themes,
        stats,
        loading,
        themesLoading,
        error,
        themesError,
        addName,
        updateName,
        deleteName,
        addTheme,
        updateTheme,
        deleteTheme,
        getName,
      }}
    >
      {children}
    </NameContext.Provider>
  );
}

export function useNames() {
  const context = useContext(NameContext);

  if (!context) {
    throw new Error(
      'useNames must be used inside a NameProvider'
    );
  }

  return context;
}