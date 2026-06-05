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
    
    const notesSnap = await getDocs(collection(db, 'notes'));
    console.log(`\n=== NOTES (${notesSnap.docs.length}) ===`);
    notesSnap.docs.forEach(doc => {
      console.log(`- ID: "${doc.id}"`);
      console.log(`  Content Preview: "${(doc.data().content || '').substring(0, 60)}..."`);
    });

  } catch (err) {
    console.error("Failed to query notes:", err);
  }
  process.exit(0);
}

test();
