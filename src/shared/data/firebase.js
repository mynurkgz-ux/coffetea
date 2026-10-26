import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyATtvVQIVA-YZhkmSr47L-sgOheIABjMME',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cfteasite.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cfteasite',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:700771274790:web:2000b87b68277368d8d6e7'
};

const app = getApps()[0] || initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
