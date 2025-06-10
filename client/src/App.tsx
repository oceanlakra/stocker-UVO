import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './features/auth/authSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { GoogleCallback } from './components/auth/GoogleCallback';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token, try to get current user
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterForm /> : <Navigate to="/dashboard" />} 
        />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;