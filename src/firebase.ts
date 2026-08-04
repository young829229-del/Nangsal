import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAxQ0dDQygkr1EpGvoaLi8tTFRZpXHeFZA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nangsal.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://nangsal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nangsal",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nangsal.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "415795685966",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:415795685966:web:77540d491c2a550754311f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DG9GQLK5JW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export const db = getFirestore(app);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: Record<string, any>;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn(`Firestore Operation [${operationType}] on [${path}]:`, error);
}

