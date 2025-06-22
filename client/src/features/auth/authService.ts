// src/features/auth/authService.ts
import axiosInstance from '@/lib/axios';

// Define AND EXPORT interfaces for request/response data
export interface RegisterData { // <<< EXPORT
  email: string;
  password: string;
  full_name?: string; // Optional, matches Pydantic schema with default
}

export interface LoginData { // <<< EXPORT
  email: string;
  password: string;
}

// This is a response type, good to export if used elsewhere, but not strictly needed for login/register calls from slice
export interface TokenResponse { // <<< EXPORT (optional if only used internally)
  access_token: string;
  token_type: string;
  // refresh_token?: string;
}

// User type should match the one in authSlice.ts or be imported/shared
// For consistency, you could define this in a shared types file or import from authSlice if User is exported there.
// Let's assume User type is defined in authSlice for now and not re-exported here to avoid duplication if not needed.
// If User from authSlice is NOT exported, then define and export it here:
export interface User { // <<< EXPORT (if not imported from authSlice)
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  // Add other fields from your backend User schema
}


const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

// Register user
export const register = async (userData: RegisterData): Promise<User> => { // Assuming backend returns User on register
  const response = await axiosInstance.post<User>(`${API_URL}/register`, userData);
  return response.data;
};

// Login user
export const login = async (userData: LoginData): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', userData.email); // FastAPI form expects 'username'
  formData.append('password', userData.password);

  const response = await axiosInstance.post<TokenResponse>(`${API_URL}/login/access-token`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (response.data.access_token) {
    localStorage.setItem('accessToken', response.data.access_token);
  }
  return response.data;
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem('accessToken');
};

// Fetch current user details (protected route)
export const fetchCurrentUser = async (token: string): Promise<User> => {
  const response = await axiosInstance.get<User>(`${API_URL}/me`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const authService = {
  register,
  login,
  logout,
  fetchCurrentUser,
};

export default authService;