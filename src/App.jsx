import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ProjectDetails } from './components/projects/ProjectDetails';
import { NotFound } from './components/common/NotFound';
import { useAuth } from './contexts/AuthContext';

// Protected Route wrapper component
function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppRoutes() {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:projectId" 
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        } 
      />

      {/* Root Route */}
      <Route 
        path="/" 
        element={
          <Navigate to={
            !currentUser 
              ? "/login" 
              : isAdmin 
                ? "/admin" 
                : "/dashboard"
          } 
          />
        } 
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
