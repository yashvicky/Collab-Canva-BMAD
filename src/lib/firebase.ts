import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function createFirebaseApp() {
  if (!firebaseConfig.apiKey) {
    // Surface clear feedback during local setup.
    throw new Error("Missing Firebase config. Check NEXT_PUBLIC_FIREBASE_* env vars.");
  }

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  return getApp();
}

export function getFirebaseAuth() {
  const app = createFirebaseApp();
  return getAuth(app);
}
