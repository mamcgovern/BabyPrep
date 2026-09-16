import {
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  browserLocalPersistence,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);

        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log('Auth state changed:', currentUser);
          setUser(currentUser);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setAuthError(error.message || 'We could not initialize authentication.');
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);

      console.log('Google sign-in successful:', result.user);

      setUser(result.user);

      return result.user;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setAuthError(error.message || 'Google sign-in failed.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}