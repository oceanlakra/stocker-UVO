// src/features/auth/OAuthCallbackPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
// Make sure User type is consistently defined or imported
import { setTokenAndUserFromOAuth, resetAuthStatus, logout, type User } from '@/features/auth/authSlice'; // Adjust the import path as necessary
import * as authService from '@/features/auth/authService'; // Ensure this service has the fetchCurrentUser method
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';


const OAuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(resetAuthStatus()); // Clear previous auth state messages

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const oauthError = params.get('error'); // Backend might send error if its own OAuth step failed
    const oauthErrorDescription = params.get('error_description');

    if (oauthError) {
        setError(oauthErrorDescription || oauthError || "OAuth process failed on the server.");
        setIsLoading(false);
        return;
    }

    if (token) {
      // We have a token from our backend. Now fetch the user profile using this token.
      authService.fetchCurrentUser(token)
        .then((user: authService.User) => { // Make sure this User type matches slice's User
          // Successfully fetched user, now update Redux state
          dispatch(setTokenAndUserFromOAuth({ token, user: user as User })); // Cast if types are structurally same but defined separately
          navigate('/dashboard', { replace: true });
        })
        .catch(err => {
          console.error("OAuth Callback: Error fetching user with new token", err);
          setError(err.message || "Failed to fetch user details after OAuth. Token might be invalid.");
          dispatch(logout()); // Clean up any potentially bad token state
        })
        .finally(() => {
            setIsLoading(false);
        });
    } else {
      setError("OAuth callback error: No token received in URL from backend.");
      setIsLoading(false);
    }
  }, [location, navigate, dispatch]); // location.search is the dependency trigger

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Processing authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {error && ( // Only show if there's an error
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Return to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      {/* If no error and not loading, it should have navigated. This is a fallback. */}
      {!error && !isLoading && (
           <p>Something went wrong, or you are already being redirected...</p>
      )}
    </div>
  );
};

export default OAuthCallbackPage;