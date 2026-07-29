import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxQ0dDQygkr1EpGvoaLi8tTFRZpXHeFZA",
  authDomain: "nangsal.firebaseapp.com",
  projectId: "nangsal",
  storageBucket: "nangsal.firebasestorage.app",
  messagingSenderId: "415795685966",
  appId: "1:415795685966:web:77540d491c2a550754311f",
  measurementId: "G-DG9GQLK5JW"
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

