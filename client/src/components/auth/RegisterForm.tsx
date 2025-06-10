import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, resetAuthStatus } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Lock, TrendingUp, CheckCircle } from 'lucide-react';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        dispatch(resetAuthStatus());
        navigate('/login');
      }, 2000);
    }
  }, [isSuccess, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
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
          <h1 className="text-xl text-gray-600">Create your account</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Start your journey to smarter investing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    {message}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
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
                    placeholder="Create a password"
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};