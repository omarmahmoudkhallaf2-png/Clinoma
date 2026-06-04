import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

console.log("Fetching notes...");
getDocs(collection(db, 'notes')).then(snap => {
  console.log(`Found ${snap.docs.length} notes:`);
  snap.docs.forEach(doc => {
    console.log(`\n--- Note ID: ${doc.id} ---`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
