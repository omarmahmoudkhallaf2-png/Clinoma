import admin from "firebase-admin";

admin.initializeApp({
  projectId: "med-prep-9d808"
});

const db = admin.firestore();

async function run() {
  try {
    const snap = await db.collection('flashspace_boards').get();
    console.log(`Total boards fetched: ${snap.size}`);
    
    const ophthBoards = [];
    snap.forEach(doc => {
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
