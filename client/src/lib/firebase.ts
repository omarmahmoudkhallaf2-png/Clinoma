import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA-tNrKNVdX6p1K0dS8g8yxJizw22bUymg",
  authDomain: "med-prep-9d808.firebaseapp.com",
  projectId: "med-prep-9d808",
  storageBucket: "med-prep-9d808.firebasestorage.app",
  messagingSenderId: "624351719181",
  appId: "1:624351719181:web:01552184e7fcea9516ca44",
  measurementId: "G-Z8W5JHEND9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with modern persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const storage = getStorage(app);
export { app };