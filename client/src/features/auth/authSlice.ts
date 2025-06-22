import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // Correct type-only import
import * as authService from './authService'; // Assuming this correctly exports RegisterData, LoginData, User
import type { RootState } from '../../store/rootReducer'; // Correct import for RootState

// Define a type for the user data based on your backend's /me response
// This User type should ideally be consistent with the User type in authService.ts
// or imported from a shared types file if you create one.
export interface User { // Exporting in case other parts of the app need this specific slice user type
  id: number;
  email: string;
  full_name?: string | null; // Ensure this matches your Pydantic User schema (nullable if Optional)
  is_active: boolean;
  is_superuser: boolean;
  // Add other fields like google_id if your backend User schema returns them via /me
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean; // Derived from token presence and successful user fetch
  isLoading: boolean;
  isSuccess: boolean; // For tracking successful operations like login/register
  isError: boolean;
  message: string | null; // For error or success messages to UI
}

// Helper to get initial token safely
const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch (e) {
    // localStorage might not be available (e.g., SSR, some privacy modes)
    console.warn("Could not access localStorage for initial token.");
    return null;
  }
};

const initialToken = getInitialToken();

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken, // Initial assumption, verified by getCurrentUser
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: null,
};

// Async Thunks
export const register = createAsyncThunk<
  authService.User, // Type of the successful return value
  authService.RegisterData, // Type of the first argument to the payload creator (userData)
  { rejectValue: string } // Type for thunkAPI.rejectWithValue
>(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData); // authService.register should return User type
    } catch (error: any) {
      const message =
        (error.response?.data?.detail) || // FastAPI often puts errors in detail
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk<
  { user: authService.User; token: string }, // Type of successful return value
  authService.LoginData,
  { rejectValue: string }
>(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const tokenData = await authService.login(userData);
      if (tokenData.access_token) {
        // After successful login, fetch user details WITH THE NEW TOKEN
        // authService.fetchCurrentUser should use the token passed or the one just set in localStorage by authService.login
        const user = await authService.fetchCurrentUser(tokenData.access_token);
        return { user, token: tokenData.access_token };
      }
      // This path should ideally not be reached if authService.login throws on failure to get token
      return thunkAPI.rejectWithValue('Login failed: No access token received.');
    } catch (error: any) {
      const message =
        (error.response?.data?.detail) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk<
  authService.User, // Type of successful return
  void, // No argument for payload creator
  { rejectValue: string; state: RootState } // Type for thunkAPI.getState() and rejectWithValue
>(
  'auth/getCurrentUser',
  async (_, thunkAPI) => {
    try {
      // Prefer token from state first, then fallback to localStorage
      // The token in state should be the most up-to-date authoritative one
      const token = thunkAPI.getState().auth.token || localStorage.getItem('accessToken');
      if (!token) {
        return thunkAPI.rejectWithValue('No token available for fetching user.');
      }
      return await authService.fetchCurrentUser(token);
    } catch (error: any) {
      const message =
        (error.response?.data?.detail) ||
        error.message ||
        error.toString();
      // If fetching user fails (e.g., token expired), dispatch logout to clean up.
      // No need to await, as this thunk is already ending.
      thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk<
  void, // No return value on success
  void, // No argument
  { rejectValue: string } // Though unlikely to reject if just clearing localStorage
>('auth/logout', async (_, thunkAPI) => {
  try {
    authService.logout(); // Clears localStorage
    // If you had a backend logout endpoint:
    // await authService.backendLogout();
  } catch (error: any) {
    // This part is less likely unless backendLogout fails
    return thunkAPI.rejectWithValue(error.toString());
  }
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
    // Used after OAuth callback when token is received from URL and user is fetched
    setTokenAndUserFromOAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = "OAuth login successful!";
        // localStorage is handled by authService.fetchCurrentUser -> then this action is called if successful
        // However, to be absolutely sure token is in localStorage for this flow:
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
      .addCase(register.fulfilled, (state, action: PayloadAction<authService.User>) => { // Type the action
        state.isLoading = false;
        state.isSuccess = true;
        // Registration returns the user object but doesn't log them in (no token)
        // state.user = action.payload; // Don't set user, they need to login
        state.message = "Registration successful! Please proceed to login.";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string; // rejectValue is string
        state.user = null; // Ensure user is cleared
        state.isAuthenticated = false; // Ensure not authenticated
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: authService.User; token: string }>) => { // Type the action
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
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
        localStorage.removeItem('accessToken'); // Ensure localStorage is also cleared on login fail
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isSuccess = true; // Logout was successful
        state.isError = false;
        state.message = "Logout successful.";
        // localStorage is cleared by authService.logout()
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false; // Reset error status for this attempt
        state.isSuccess = false;
        state.message = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<authService.User>) => { // Type the action
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.isAuthenticated = true; // Crucial: set to true only on successful fetch
        state.message = "User loaded successfully.";
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true; // Fetching user failed
        state.message = action.payload as string; // e.g., "No token found" or API error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false; // Crucial: set to false if user cannot be fetched
        localStorage.removeItem('accessToken'); // Clean up potentially invalid token
      });
  },
});

export const { resetAuthStatus, setTokenAndUserFromOAuth } = authSlice.actions;
export default authSlice.reducer;