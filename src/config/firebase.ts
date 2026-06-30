import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDixl6yUfaW01WdrH4ygSUDLJa7mEkf6Eg",
  authDomain: "thecollegewallet-136ee.firebaseapp.com",
  projectId: "thecollegewallet-136ee",
  storageBucket: "thecollegewallet-136ee.firebasestorage.app",
  messagingSenderId: "295939848724",
  appId: "1:295939848724:web:934acd198734d1b2bb0501",
  measurementId: "G-5WN7WXQTGB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
