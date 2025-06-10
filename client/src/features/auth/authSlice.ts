// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as authService from './authService';

// Define a type for the user data (adjust based on your backend's /me response)
interface User {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  google_id?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: null,
};

// Async Thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: authService.RegisterData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.detail) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: authService.LoginData, thunkAPI) => {
    try {
      const tokenData = await authService.login(userData);
      if (tokenData.access_token) {
        const user = await authService.fetchCurrentUser(tokenData.access_token);
        return { user, token: tokenData.access_token };
      }
      return thunkAPI.rejectWithValue('Login failed: No access token received.');
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.detail) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, thunkAPI) => {
    try {
      // Import RootState type here to avoid circular dependency
      const state = thunkAPI.getState() as any;
      const token = state.auth.token || localStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No token found');
      }
      return await authService.fetchCurrentUser(token);
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.detail) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = null;
    },
    setTokenAndUserFromOAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.token);
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Registration successful! Please login.";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = (action.payload as any).user;
        state.token = (action.payload as any).token;
        state.isAuthenticated = true;
        state.message = "Login successful!";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = "Logout successful.";
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload as User;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
      });
  },
});

export const { resetAuthStatus, setTokenAndUserFromOAuth } = authSlice.actions;
export default authSlice.reducer;