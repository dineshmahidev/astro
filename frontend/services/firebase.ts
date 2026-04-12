import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlB7VXNfGD7O_n2-VeQvdJTgAk5LjRw_0",
  authDomain: "astro-b79e9.firebaseapp.com",
  projectId: "astro-b79e9",
  storageBucket: "astro-b79e9.firebasestorage.app",
  messagingSenderId: "279864039046",
  appId: "1:279864039046:android:3ffe6c00528e34a58be307"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services with Persistence
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;

/**
 * NOTE: This Firebase integration is separate from your existing Laravel/Python backend.
 * You can use 'db' to interact with Firestore without affecting your axios-based api.ts setup.
 * 
 * Example usage:
 * import { collection, addDoc } from "firebase/firestore";
 * import { db } from "@/services/firebase";
 * 
 * await addDoc(collection(db, "my_collection"), { data: "hello" });
 */
