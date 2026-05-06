# 🧠 Flashcards System - Med Prep

The Flashcards system is a professional, integrated module designed for medical students to master their curriculum using **Spaced Repetition (SRS)**.

## 🚀 Key Modules

### 1. Study Mode (Smart Engine)
- **Engine**: Powered by the **SM-2 algorithm** (SuperMemo-2), which calculates the optimal review time for each card based on your performance.
- **UI/UX**: 
  - 3D Flip card animations.
  - SRS Rating buttons (Again, Hard, Good, Easy).
  - Real-time progress tracking.
  - Interactive session summary with performance stats.

### 2. Create Mode (Editor)
- **Deck Management**: Create custom decks for different subjects (Anatomy, Physiology, etc.).
- **Live Editing**: Real-time card creation with front/back fields and auto-tagging.
- **AI Generator**: A dedicated panel where you can paste text or notes, and the system will automatically generate flashcards for you using **Google Gemini 1.5 Flash**.

### 3. Import Mode
- **Multi-Format Support**: Import decks from **CSV** or **JSON**.
- **Process**:
  - **Step 1**: File upload and parsing.
  - **Step 2**: Visual preview and validation of cards.
  - **Step 3**: Metadata assignment (Deck title, Subject) and finalization.

## ⚙️ Technical Architecture

- **Logic**: Centralized SRS logic in `src/lib/srs.ts`.
- **Storage**: Highly efficient Firestore structure with `decks` and `flashcards` collections.
- **Performance**: Optimized for mobile and desktop with Framer Motion animations and responsive CSS.
- **Security**: Updated `firestore.rules` to ensure students only access and manage their own data.

## 📂 File Structure
- `src/types/flashcard.ts`: Type definitions.
- `src/lib/srs.ts`: Spaced Repetition logic.
- `src/lib/gemini.ts`: AI Generation service.
- `src/pages/flashcards/`: Dashboard, Study, Create, and Import pages.
- `src/index.css`: Custom 3D transform utilities.

---
> [!TIP]
> You can find the Flashcards module in the main sidebar under **"الفلاش كارد"**. Start by creating a deck or importing a CSV file to see the system in action!
