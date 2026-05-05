import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { ReactElement } from "react";
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

const ProtectedRoute = ({ children, requireAdmin = false, useLayout = true }: { children: ReactElement, requireAdmin?: boolean, useLayout?: boolean }) => {
  const { user, userRole, loading, needsProfileCompletion } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  // If user hasn't completed their profile (Arabic name), redirect them (except to the completion page itself)
  if (needsProfileCompletion && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  if (requireAdmin && userRole !== 'admin') return <Navigate to="/dashboard" />;
  
  return useLayout ? <MainLayout>{children}</MainLayout> : children;
};

import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
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
          
          {/* New Filtered Routes */}
          <Route path="/incorrect" element={<ProtectedRoute><FilteredQuiz type="incorrect" /></ProtectedRoute>} />
          <Route path="/flagged" element={<ProtectedRoute><FilteredQuiz type="flagged" /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/notes/:category" element={<ProtectedRoute><NoteViewer /></ProtectedRoute>} />
          
          {/* Formal Exam System */}
          <Route path="/exams" element={<ProtectedRoute><AvailableExams /></ProtectedRoute>} />
          <Route path="/exam/:examId" element={<ProtectedRoute useLayout={false}><FormalExam /></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute requireAdmin><ExamResultsDashboard /></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}