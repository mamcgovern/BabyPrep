import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCB8uyxP7O2ScuQLBFfGwCC4e1WJOeMm9A",
  authDomain: "baby-prep-4ebb3.firebaseapp.com",
  projectId: "baby-prep-4ebb3",
  storageBucket: "baby-prep-4ebb3.firebasestorage.app",
  messagingSenderId: "708877422563",
  appId: "1:708877422563:web:984c3ec1dd5b7611071ad6",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();