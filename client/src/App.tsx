import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import type { ReactElement } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QuizSetup from "./pages/QuizSetup";
import Quiz from "./pages/Quiz";
import AdminDashboard from "./pages/admin/AdminDashboard";

const ProtectedRoute = ({ children, requireAdmin = false }: { children: ReactElement, requireAdmin?: boolean }) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && userRole !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/quiz-setup" element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}