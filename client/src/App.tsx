<<<<<<< HEAD
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
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Analysis } from "@/pages/Analysis";
import { Comparison } from "@/pages/Comparison";
import { Prediction } from "@/pages/Prediction";
import { Login } from "@/pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="comparison" element={<Comparison />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
>>>>>>> 88770b0b3af739fa75a2a9e5cd9626df32f3061f
  );
}

export default App;