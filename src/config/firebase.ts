import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy-messaging-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "dummy-app-id",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
