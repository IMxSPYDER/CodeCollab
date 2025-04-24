import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import EditorView from './pages/EditorView';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
<Routes>
  <Route path="/" element={<Home />} />
  
  <Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <Login />} />
  <Route path="/signup" element={user ? <Navigate to="/app/dashboard" /> : <Signup />} />

  <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route index element={<Navigate to="/app/dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="profile" element={<Profile />} />
    <Route path="project/:projectId" element={<ProjectView />} />
    <Route path="editor/:fileId" element={<EditorView />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>

  );
}

export default App;