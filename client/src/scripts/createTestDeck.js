
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-tNrKNVdX6p1K0dS8g8yxJizw22bUymg",
  authDomain: "med-prep-9d808.firebaseapp.com",
  projectId: "med-prep-9d808",
  storageBucket: "med-prep-9d808.firebasestorage.app",
  messagingSenderId: "624351719181",
  appId: "1:624351719181:web:01552184e7fcea9516ca44"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestDeck() {
  try {
    const deckRef = await addDoc(collection(db, 'decks'), {
      title: "AI Test Deck (By Antigravity)",
      description: "A test deck created by your AI assistant to verify export/import logic.",
      subject: "Anatomy",
      userId: "ADMIN_TEST",
      isPublic: true,
      cardCount: 3,
      createdAt: Date.now()
    });

    const batch = writeBatch(db);
    const cards = [
      { front: "What is the largest organ in the human body?", back: "The Skin" },
      { front: "How many bones are in the adult human body?", back: "206" },
      { front: "Which muscle is known as the 'pacemaker' of the body?", back: "The Heart (Myocardium)" }
    ];

    cards.forEach(card => {
      const cardRef = doc(collection(db, 'flashcards'));
      batch.set(cardRef, {
        ...card,
        deckId: deckRef.id,
        userId: "ADMIN_TEST",
        createdAt: Date.now(),
        nextReview: Date.now(),
        status: 'new'
      });
    });

    await batch.commit();
    console.log("Success: Test deck created with ID", deckRef.id);
  } catch (err) {
    console.error("Error:", err);
  }
}

createTestDeck();
