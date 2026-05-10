
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function cleanEverything() {
  console.log('🚀 Starting deep clean...');
  const collections = ['questions', 'decks', 'flashcards', 'exam_results', 'assistant_chats', 'study_rooms'];
  
  for (const col of collections) {
    console.log(`🧹 Deleting collection: ${col}...`);
    await deleteCollection(col, 100);
  }
  
  console.log('✅ Database is now CLEAN and ready for fresh content!');
  process.exit(0);
}

cleanEverything().catch(err => {
  console.error('❌ Clean-up failed:', err);
  process.exit(1);
});
