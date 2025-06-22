// src/features/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form'; // SubmitHandler is inferred or can be imported
import type { SubmitHandler } from 'react-hook-form'; // Explicit import
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, resetAuthStatus } from '@/features/auth/authSlice'; // Adjust the import path as necessary
import type { LoginData } from '@/features/auth/authService'; // Ensure type import

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isError, message } = useAppSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/dashboard";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    const loginData: LoginData = { email: data.email, password: data.password };
    dispatch(resetAuthStatus()); // Reset previous status before new attempt
    dispatch(login(loginData));
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth initiation endpoint
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google/login`;
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  // Effect to clear messages when component unmounts or error/message changes from elsewhere
  useEffect(() => {
    return () => {
        // Only reset if there was a message or error to clear from this page's actions
        if (isError || message) { 
            dispatch(resetAuthStatus());
        }
    };
  }, [dispatch, isError, message]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {isError && message && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </Form>

          <Separator className="my-6" />

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.5 0 256S110.3 0 244 0c78.2 0 144.3 34.4 192.7 89.9l-73.8 66.3C324.9 125.9 288.8 112 244 112c-84.6 0-152.9 70.2-152.9 158.3s68.3 158.3 152.9 158.3c75.6 0 121.1-35.7 125.2-87.5H244v-73.1h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Login with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;