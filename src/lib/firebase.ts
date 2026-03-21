import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prerendering / build step might not have environment variables.
// initializeApp would fail with "auth/invalid-api-key" if apiKey is undefined.
const app = 
  !getApps().length && firebaseConfig.apiKey 
    ? initializeApp(firebaseConfig) 
    : (getApps().length > 0 ? getApp() : undefined);

// Export auth/db. If app is undefined, they'll be undefined, preventing crash during import.
// These services will not be functional, but the build (where they aren't actually called) will succeed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = app ? getAuth(app) : undefined as unknown as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = app ? initializeFirestore(app, { experimentalForceLongPolling: true }) : undefined as unknown as any;

export default app;
