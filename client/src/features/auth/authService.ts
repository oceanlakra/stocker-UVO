// src/features/auth/authService.ts

const API_URL = 'http://localhost:8000/api/v1';

// Define interfaces for request/response data (match your backend Pydantic schemas)
export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  google_id?: string | null;
}

// Register user
export const register = async (userData: RegisterData): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }

  return response.json();
};

// Login user
export const login = async (userData: LoginData): Promise<TokenResponse> => {
  const formData = new FormData();
  formData.append('username', userData.username);
  formData.append('password', userData.password);

  const response = await fetch(`${API_URL}/auth/login/access-token`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('accessToken');
};

// Fetch current user details (protected route)
export const fetchCurrentUser = async (token: string): Promise<User> => {
  console.log('Fetching user with token:', token.substring(0, 20) + '...');
  
  const response = await fetch(`${API_URL}/auth/me`, {  // Changed from /users/me to /auth/me
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { detail: `HTTP ${response.status}: ${errorText}` };
    }
    
    throw new Error(errorData.detail || `Failed to fetch user: ${response.status}`);
  }

  const userData = await response.json();
  console.log('User data received:', userData);
  return userData;
};

// Google OAuth URL - THIS IS THE MISSING EXPORT
export const getGoogleAuthUrl = (): string => {
  return `${API_URL}/auth/google/login`;
};

// Test password reset (if you want to implement this later)
export const testEmail = async (emailTo: string) => {
  const response = await fetch(`${API_URL}/utils/test-email/?email_to=${emailTo}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to send test email');
  }

  return response.json();
};

// Password reset request
export const passwordRecovery = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/password-recovery/${email}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Password recovery failed');
  }

  return response.json();
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_URL}/auth/reset-password/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Password reset failed');
  }

  return response.json();
};