// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute'; // Create this file
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUser } from '@/features/auth/authSlice';
import { useEffect } from 'react';

// Import Page Components (Create basic placeholder files for these for now)
// Placeholder Pages (create these files with basic content)
// src/pages/LandingPage.tsx
// src/features/auth/LoginPage.tsx
// src/features/auth/RegisterPage.tsx
// src/features/auth/OAuthCallbackPage.tsx (or src/pages/OAuthCallbackPage.tsx)
// src/pages/DashboardPage.tsx
// src/features/analysis/AnalysisPage.tsx
// src/features/prediction/PredictionPage.tsx
// src/features/comparison/ComparisonPage.tsx
// src/features/history/HistoryPage.tsx
// src/pages/NotFoundPage.tsx

// Example: src/pages/LandingPage.tsx
// const LandingPage = () => <div className="text-2xl">Landing Page Content</div>;
// Example: src/features/auth/LoginPage.tsx
// const LoginPage = () => <div className="text-2xl">Login Page Content</div>;
// ...and so on for other pages for now.

// For actual pages:
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

// Placeholder for feature pages (create these files later)
const AnalysisPage = () => <div>Analysis Page (Protected)</div>;
const PredictionPage = () => <div>Prediction Page (Protected)</div>;
const ComparisonPage = () => <div>Comparison Page (Protected)</div>;
const HistoryPage = () => <div>History Page (Protected)</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;


function App() {
  const dispatch = useAppDispatch();
  const { token, isLoading: authIsLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // On app load, if a token exists, try to fetch the current user
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]); // Depend on token to re-fetch if token changes externally (less likely here)

  // Optional: Global loading state for initial auth check
  if (authIsLoading && token) { // Only show loading if checking token, not general loading
     return <div className="min-h-screen flex items-center justify-center">Authenticating...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes with MainLayout (Navbar & Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<OAuthCallbackPage />} /> {/* For Google Redirect */}
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/prediction" element={<PredictionPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/history" element={<HistoryPage />} />
            {/* Add other protected routes here */}
          </Route>
          
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
        </Route>
        
        {/* You can have routes without MainLayout here if needed */}
        {/* e.g. <Route path="/some-special-page" element={<SpecialPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;