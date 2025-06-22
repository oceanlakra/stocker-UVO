// src/features/auth/RegisterPage.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, resetAuthStatus } from '@/features/auth/authSlice'; // Adjust the import path as necessary
import type { RegisterData } from '@/features/auth/authService'; // Ensure type import

const registerFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, isError, message, isSuccess: isRegistrationSuccess } = useAppSelector((state) => state.auth);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    const registerData: RegisterData = {
      email: data.email,
      password: data.password,
      full_name: data.fullName || undefined,
    };
    dispatch(resetAuthStatus()); // Reset before new attempt
    dispatch(register(registerData));
  };

  useEffect(() => {
    if (isRegistrationSuccess) {
      // Optional: automatically navigate to login after a short delay or display success message longer
      // setTimeout(() => navigate('/login'), 3000); // Example redirect
    }
  }, [isRegistrationSuccess, navigate]);

  // Effect to clear messages when component unmounts or error/message changes from elsewhere
   useEffect(() => {
    return () => {
        if (isError || isRegistrationSuccess || message) {
            dispatch(resetAuthStatus());
        }
    };
  }, [dispatch, isError, isRegistrationSuccess, message]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          {isError && message && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Registration Failed</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {isRegistrationSuccess && message && !isLoading && (
             <Alert variant="default" className="mb-4 border-green-500 text-green-700 dark:border-green-700 dark:text-green-300">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{message} You can now <Link to="/login" className="font-bold text-primary hover:underline">login</Link>.</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isRegistrationSuccess}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;