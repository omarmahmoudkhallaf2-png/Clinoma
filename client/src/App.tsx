import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { ReactElement } from "react";
import { Toaster, toast } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { DataProvider } from "./context/DataContext";
import { PomodoroProvider } from "./context/PomodoroContext";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/ui/SplashScreen";
import FloatingTimer from "./components/pomodoro/FloatingTimer";
import MainLayout from "./components/layout/MainLayout";
import { db } from "./lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const QuizSetup = lazy(() => import("./pages/QuizSetup"));
const Quiz = lazy(() => import("./pages/Quiz"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const CourseSubjects = lazy(() => import("./pages/CourseSubjects"));
const SubjectLectures = lazy(() => import("./pages/SubjectLectures"));
const SubjectOptions = lazy(() => import("./pages/SubjectOptions"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const AvailableCourses = lazy(() => import("./pages/AvailableCourses"));
const FilteredQuiz = lazy(() => import("./pages/FilteredQuiz"));
const ReviewDashboard = lazy(() => import("./pages/ReviewDashboard"));
const FormalExam = lazy(() => import("./pages/FormalExam"));
const ExamResultsDashboard = lazy(() => import("./pages/ExamResultsDashboard"));
const AvailableExams = lazy(() => import("./pages/AvailableExams"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const FlashSelection = lazy(() => import("./pages/flashcards/FlashSelection"));
const FlashcardsDashboard = lazy(() => import("./pages/flashcards/FlashcardsDashboard"));
const StudyMode = lazy(() => import("./pages/flashcards/StudyMode"));
const CreateCard = lazy(() => import("./pages/flashcards/CreateCard"));
const ImportCards = lazy(() => import("./pages/flashcards/ImportCards"));
const FlashSpace = lazy(() => import("./pages/flashcards/FlashSpace"));
const FantasyGroups = lazy(() => import("./pages/flashcards/FantasyGroups"));
const AIExamGenerator = lazy(() => import("./pages/AIExamGenerator"));
const Pomodoro = lazy(() => import("./pages/Pomodoro"));
const DataThemes = lazy(() => import("./pages/DataThemes"));
const PediatricsHub = lazy(() => import("./pages/PediatricsHub"));
const PediatricsFolder = lazy(() => import("./pages/PediatricsFolder"));
const FirstPaperCamp = lazy(() => import("./pages/FirstPaperCamp"));
const QuestionBanksPortal = lazy(() => import("./pages/QuestionBanksPortal"));
const ClinomaCardsApp = lazy(() => import("./clinoma-cards/src/App"));
const ClinomaCardsOphthApp = lazy(() => import("./clinoma-cards-ophth/src/App"));
const OphthalmologyMcq = lazy(() => import("./pages/flashcards/OphthalmologyMcq"));
const OphthalmologyWritten = lazy(() => import("./pages/flashcards/OphthalmologyWritten"));

import { CommandPalette } from "./components/ui/CommandPalette";
import { AmbientAudioProvider } from "./context/AmbientAudioContext";

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
      <Suspense fallback={
        <div className="relative flex flex-col items-center scale-90 sm:scale-125 md:scale-150">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/complete-profile" element={<ProtectedRoute useLayout={false}><CompleteProfile /></ProtectedRoute>} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/available" element={<ProtectedRoute><AvailableCourses /></ProtectedRoute>} />
          <Route path="/course/pediatrics_course/subject/first_paper_camp/lectures" element={<ProtectedRoute><FirstPaperCamp /></ProtectedRoute>} />
          <Route path="/course/pediatrics_course/subject/:subjectId/lectures" element={<ProtectedRoute><PediatricsHub /></ProtectedRoute>} />
          <Route path="/course/pediatrics_course/subject/:subjectId/folder/:folderId" element={<ProtectedRoute><PediatricsFolder /></ProtectedRoute>} />
          <Route path="/course/:courseId" element={<ProtectedRoute><CourseSubjects /></ProtectedRoute>} />
          <Route path="/course/:courseId/subject/:subjectId/lectures" element={<ProtectedRoute><SubjectLectures /></ProtectedRoute>} />
          <Route path="/course/:courseId/subject/:subjectId/lecture/:lectureNumber" element={<ProtectedRoute><SubjectOptions /></ProtectedRoute>} />
          <Route path="/review" element={<ProtectedRoute><ReviewDashboard /></ProtectedRoute>} />
          <Route path="/quiz-setup" element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute useLayout={false}><Quiz /></ProtectedRoute>} />
          
          <Route path="/incorrect" element={<ProtectedRoute><FilteredQuiz type="incorrect" /></ProtectedRoute>} />
          <Route path="/flagged" element={<ProtectedRoute><FilteredQuiz type="flagged" /></ProtectedRoute>} />
          <Route path="/question-banks" element={<ProtectedRoute><QuestionBanksPortal /></ProtectedRoute>} />
          
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          
          <Route path="/exams" element={<ProtectedRoute><AvailableExams /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/exam/:examId" element={<ProtectedRoute useLayout={false}><FormalExam /></ProtectedRoute>} />
          
          {/* Flashcards Routes */}
          <Route path="/flashcards" element={<ProtectedRoute><FlashSelection /></ProtectedRoute>} />
          <Route path="/flashcards/decks" element={<ProtectedRoute><FlashcardsDashboard /></ProtectedRoute>} />
          <Route path="/flashcards/space" element={<ProtectedRoute useLayout={false}><FlashSpace /></ProtectedRoute>} />
          <Route path="/flashcards/second-paper-interactive" element={<ProtectedRoute useLayout={false}><ClinomaCardsApp onExit={() => window.history.back()} /></ProtectedRoute>} />
          <Route path="/flashcards/second-paper-expectations" element={<ProtectedRoute useLayout={false}><ClinomaCardsApp isExpectations={true} onExit={() => window.history.back()} /></ProtectedRoute>} />
          <Route path="/flashcards/ophthalmology-interactive" element={<ProtectedRoute useLayout={false}><ClinomaCardsOphthApp onExit={() => window.history.back()} /></ProtectedRoute>} />
          <Route path="/flashcards/ophthalmology-mcq" element={<ProtectedRoute useLayout={false}><OphthalmologyMcq onExit={() => window.history.back()} /></ProtectedRoute>} />
          <Route path="/flashcards/ophthalmology-written" element={<ProtectedRoute useLayout={false}><OphthalmologyWritten onExit={() => window.history.back()} /></ProtectedRoute>} />
          <Route path="/flashcards/fantasy" element={<ProtectedRoute useLayout={false}><FantasyGroups /></ProtectedRoute>} />
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
      </Suspense>
    </AnimatePresence>
  );
};

export default function App() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Force update contact info in Firestore to ensure it works for everyone
    const syncContactInfo = async () => {
      try {
        await setDoc(doc(db, 'settings', 'general'), {
          telegramUser: 'Clinoma_Admins',
          whatsappNumber: '01039322938',
          preferredContact: 'telegram'
        }, { merge: true });
      } catch (err) {
        console.error("Sync error:", err);
      }
    };
    syncContactInfo();
  }, []);

  useEffect(() => {
    const handlePomodoroComplete = (e: any) => {
      toast(e.detail.message, {
        icon: '🔔',
        duration: 5000,
      });
    };
    window.addEventListener('pomodoro-complete', handlePomodoroComplete);
    return () => window.removeEventListener('pomodoro-complete', handlePomodoroComplete);
  }, []);

  return (
    <ThemeProvider>
      <DataProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        <AmbientAudioProvider>
          <PomodoroProvider>
            <Toaster position="top-right" toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px border border-border',
                borderRadius: 'var(--radius)',
              }
            }} />
            <AnimatedRoutes />
            {user && <FloatingTimer />}
            <CommandPalette />
          </PomodoroProvider>
        </AmbientAudioProvider>
      </Router>
      </DataProvider>
    </ThemeProvider>
  );
}