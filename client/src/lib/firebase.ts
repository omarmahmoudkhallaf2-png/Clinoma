import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Primary Project Config (Main Site)
const firebaseConfig = {
  apiKey: "AIzaSyA-tNrKNVdX6p1K0dS8g8yxJizw22bUymg",
  authDomain: "med-prep-9d808.firebaseapp.com",
  projectId: "med-prep-9d808",
  storageBucket: "med-prep-9d808.firebasestorage.app",
  messagingSenderId: "624351719181",
  appId: "1:624351719181:web:01552184e7fcea9516ca44",
  measurementId: "G-Z8W5JHEND9"
};

// Secondary Project Config (Exams & Quotas)
const examFirebaseConfig = {
  apiKey: "AIzaSyBIhRSTzGMNQHyzbCtQ1cbQLphm-7lsE_g",
  authDomain: "exams-19980.firebaseapp.com",
  projectId: "exams-19980",
  storageBucket: "exams-19980.firebasestorage.app",
  messagingSenderId: "30732598353",
  appId: "1:30732598353:web:c689a8d78b4c8502588c70",
  measurementId: "G-H5X7EYL6EV"
};

// Initialize Primary Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const storage = getStorage(app);

// Initialize Secondary Firebase (Exams)
const examApp = initializeApp(examFirebaseConfig, "examApp");
export const dbExam = initializeFirestore(examApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const authExam = getAuth(examApp);
export const storageExam = getStorage(examApp);

export { app, examApp };