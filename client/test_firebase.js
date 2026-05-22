import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-tNrKNVdX6p1K0dS8g8yxJizw22bUymg",
  authDomain: "med-prep-9d808.firebaseapp.com",
  projectId: "med-prep-9d808",
  storageBucket: "med-prep-9d808.firebasestorage.app",
  messagingSenderId: "624351719181",
  appId: "1:624351719181:web:01552184e7fcea9516ca44",
  measurementId: "G-Z8W5JHEND9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Connecting to Firestore...");
    await signInAnonymously(auth);
    console.log("Signed in anonymously!");
    
    // 1. Courses
    const coursesSnap = await getDocs(collection(db, 'courses'));
    console.log(`\n=== COURSES (${coursesSnap.docs.length}) ===`);
    coursesSnap.docs.forEach(doc => {
      console.log(`- Course ID: ${doc.id}`);
      console.log(`  Data:`, doc.data());
    });

    // 2. Subjects
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    console.log(`\n=== SUBJECTS (${subjectsSnap.docs.length}) ===`);
    subjectsSnap.docs.forEach(doc => {
      console.log(`- Subject ID: ${doc.id}`);
      console.log(`  Data:`, doc.data());
    });

    // 3. Decks
    const decksSnap = await getDocs(collection(db, 'decks'));
    console.log(`\n=== DECKS (${decksSnap.docs.length}) ===`);
    decksSnap.docs.forEach(doc => {
      console.log(`- Deck ID: ${doc.id}`);
      console.log(`  Data:`, doc.data());
    });

  } catch (err) {
    console.error("Failed:", err);
  }
  process.exit(0);
}

test();
