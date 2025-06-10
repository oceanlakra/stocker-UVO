import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setTokenAndUserFromOAuth } from '../../features/auth/authSlice';
import { fetchCurrentUser } from '../../features/auth/authService';
import { useAppDispatch } from '../../store/hooks';
import { TrendingUp, AlertCircle } from 'lucide-react';

export const GoogleCallback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Google callback triggered');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams));

        const token = searchParams.get('access_token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          console.error('OAuth error from URL:', errorParam);
          setError(getErrorMessage(errorParam));
          setTimeout(() => navigate('/login?error=' + errorParam), 3000);
          return;
        }

        if (!token) {
          console.error('No access token found in URL');
          setError('No authentication token received');
          setTimeout(() => navigate('/login?error=no_token'), 3000);
          return;
        }

        console.log('Token received, fetching user...');
        
        // Store token first
        localStorage.setItem('accessToken', token);
        
        // Fetch user details
        const user = await fetchCurrentUser(token);
        console.log('User fetched successfully:', user);
        
        // Update Redux state
        dispatch(setTokenAndUserFromOAuth({ token, user }));
        
        // Navigate to dashboard
        navigate('/dashboard');
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Failed to complete authentication');
        setTimeout(() => navigate('/login?error=callback_failed'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, dispatch, navigate]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'oauth_failed':
        return 'Google authentication failed. Please try again.';
      case 'user_info_failed':
        return 'Failed to get user information from Google.';
      case 'database_error':
        return 'Database error occurred. Please try again.';
      case 'no_token':
        return 'No authentication token received.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Stocker</span>
          </div>
          
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Authentication Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-400 mt-2">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-6">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Stocker</span>
        </div>
        
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isProcessing ? 'Processing authentication...' : 'Completing sign in...'}
        </p>
        <p className="text-sm text-gray-400 mt-2">Please wait</p>
      </motion.div>
    </div>
  );
};