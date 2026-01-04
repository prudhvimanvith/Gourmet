import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';

import RecipeBuilder from './pages/RecipeBuilder';
import Inventory from './pages/Inventory';
import Prep from './pages/Prep';

import Settings from './pages/Settings';

const queryClient = new QueryClient();

// Authorization Wrapper
const ProtectedRoute = ({ children, roles }: { children: ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user, token } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <div className="flex h-screen items-center justify-center text-slate-400">Access Denied: Insufficient Permissions</div>;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/pos" element={
              <ProtectedRoute>
                <Layout><POS /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/recipes" element={
              <ProtectedRoute roles={['ADMIN', 'CHEF']}>
                <Layout><RecipeBuilder /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/items" element={
              <ProtectedRoute roles={['ADMIN', 'CHEF']}>
                <Layout><Inventory /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/prep" element={
              <ProtectedRoute roles={['ADMIN', 'CHEF']}>
                <Layout><Prep /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
