import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { ReactElement } from "react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QuizSetup from "./pages/QuizSetup";
import Quiz from "./pages/Quiz";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Settings from "./pages/Settings";
import NoteViewer from "./pages/NoteViewer";
import CourseSubjects from "./pages/CourseSubjects";
import SubjectLectures from "./pages/SubjectLectures";
import SubjectOptions from "./pages/SubjectOptions";
import CompleteProfile from "./pages/CompleteProfile";
import AvailableCourses from "./pages/AvailableCourses";

import MainLayout from "./components/layout/MainLayout";
import FilteredQuiz from "./pages/FilteredQuiz";
import ReviewDashboard from "./pages/ReviewDashboard";
import FormalExam from "./pages/FormalExam";
import ExamResultsDashboard from "./pages/ExamResultsDashboard";
import AvailableExams from "./pages/AvailableExams";
import AIAssistant from "./pages/AIAssistant";
import FlashSelection from "./pages/flashcards/FlashSelection";
import FlashcardsDashboard from "./pages/flashcards/FlashcardsDashboard";
import StudyMode from "./pages/flashcards/StudyMode";
import CreateCard from "./pages/flashcards/CreateCard";
import ImportCards from "./pages/flashcards/ImportCards";
import FlashSpace from "./pages/flashcards/FlashSpace";
import AIExamGenerator from "./pages/AIExamGenerator";
import Pomodoro from "./pages/Pomodoro";
import DataThemes from "./pages/DataThemes";

import { CommandPalette } from "./components/ui/CommandPalette";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/ui/SplashScreen";
import { useState, useEffect } from "react";
import { db } from "./lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, requireAdmin = false, useLayout = true }: { children: ReactElement, requireAdmin?: boolean, useLayout?: boolean }) => {
  const { user, userRole, loading, needsProfileCompletion } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (needsProfileCompletion && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  if (requireAdmin && userRole !== 'admin') return <Navigate to="/dashboard" />;
  
  return useLayout ? <MainLayout>{children}</MainLayout> : children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complete-profile" element={<ProtectedRoute useLayout={false}><CompleteProfile /></ProtectedRoute>} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/available" element={<ProtectedRoute><AvailableCourses /></ProtectedRoute>} />
        <Route path="/course/:courseId" element={<ProtectedRoute><CourseSubjects /></ProtectedRoute>} />
        <Route path="/course/:courseId/subject/:subjectId/lectures" element={<ProtectedRoute><SubjectLectures /></ProtectedRoute>} />
        <Route path="/course/:courseId/subject/:subjectId/lecture/:lectureNumber" element={<ProtectedRoute><SubjectOptions /></ProtectedRoute>} />
        <Route path="/review" element={<ProtectedRoute><ReviewDashboard /></ProtectedRoute>} />
        <Route path="/quiz-setup" element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute useLayout={false}><Quiz /></ProtectedRoute>} />
        
        <Route path="/incorrect" element={<ProtectedRoute><FilteredQuiz type="incorrect" /></ProtectedRoute>} />
        <Route path="/flagged" element={<ProtectedRoute><FilteredQuiz type="flagged" /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        
        <Route path="/exams" element={<ProtectedRoute><AvailableExams /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/exam/:examId" element={<ProtectedRoute useLayout={false}><FormalExam /></ProtectedRoute>} />
        
        {/* Flashcards Routes */}
        <Route path="/flashcards" element={<ProtectedRoute><FlashSelection /></ProtectedRoute>} />
        <Route path="/flashcards/decks" element={<ProtectedRoute><FlashcardsDashboard /></ProtectedRoute>} />
        <Route path="/flashcards/space" element={<ProtectedRoute useLayout={false}><FlashSpace /></ProtectedRoute>} />
        <Route path="/flashcards/study/:deckId" element={<ProtectedRoute useLayout={false}><StudyMode /></ProtectedRoute>} />
        <Route path="/flashcards/create" element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
        <Route path="/flashcards/edit/:deckId" element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
        <Route path="/flashcards/import" element={<ProtectedRoute><ImportCards /></ProtectedRoute>} />

        <Route path="/admin/results" element={<ProtectedRoute requireAdmin><ExamResultsDashboard /></ProtectedRoute>} />
        <Route path="/admin/ai-generate" element={<ProtectedRoute requireAdmin><AIExamGenerator /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/pomodoro" element={<ProtectedRoute useLayout={false}><Pomodoro /></ProtectedRoute>} />
        <Route path="/data-themes" element={<ProtectedRoute><DataThemes /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const { userRole } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Force update contact info in Firestore to ensure it works for everyone
    const syncContactInfo = async () => {
      try {
        await setDoc(doc(db, 'settings', 'general'), {
          telegramUser: 'ClinomaOwner',
          whatsappNumber: '01040981906',
          preferredContact: 'telegram'
        }, { merge: true });
      } catch (err) {
        console.error("Sync error:", err);
      }
    };
    syncContactInfo();
  }, []);

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        {userRole === 'admin' && <CommandPalette />}
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px border border-border',
            borderRadius: 'var(--radius)',
          }
        }} />
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  );
}