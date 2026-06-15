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

async function run() {
  try {
    console.log("Fetching boards without sign-in...");
    const snap = await getDocs(collection(db, 'flashspace_boards'));
    console.log(`Total boards fetched: ${snap.docs.length}`);
    
    const ophthBoards = [];
    snap.docs.forEach(doc => {
      const data = doc.data();
      const mod = data.module || '';
      if (mod.toLowerCase().includes('opth') || mod.toLowerCase().includes('ophthal')) {
        ophthBoards.push({
          id: doc.id,
          disease: data.disease,
          module: data.module,
          system: data.system,
          subSystem: data.subSystem
        });
      }
    });
    
    console.log(`\n=== OPHTHALMOLOGY BOARDS (${ophthBoards.length}) ===`);
    ophthBoards.forEach((b, i) => {
      console.log(`${i+1}. Disease: "${b.disease}", System/Chapter: "${b.system}", SubSystem: "${b.subSystem}"`);
    });
    
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

run();
