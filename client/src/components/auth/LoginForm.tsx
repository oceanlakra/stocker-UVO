import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getGoogleAuthUrl } from '../../features/auth/authService';
import { Mail, Lock, Chrome, TrendingUp, AlertTriangle } from 'lucide-react';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, isError, message } = useAppSelector((state) => state.auth);

  // Handle OAuth error from URL params
  const oauthError = searchParams.get('error');
  const getOAuthErrorMessage = (error: string) => {
    switch (error) {
      case 'oauth_failed':
        return 'Google sign-in failed. Please try again.';
      case 'fetch_user_failed':
        return 'Failed to get user information. Please try again.';
      case 'callback_failed':
        return 'Authentication callback failed. Please try again.';
      case 'no_token':
        return 'No authentication token received. Please try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Stocker</span>
          </motion.div>
          <h1 className="text-xl text-gray-600">Welcome back</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Error Alert */}
            {oauthError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{getOAuthErrorMessage(oauthError)}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Regular Login Error Alert */}
            {isError && !oauthError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};