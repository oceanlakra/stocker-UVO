import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import comparisonService, { type ComparisonInput, type ComparisonResponse } from './comparisonService';
import type { RootState } from '@/store/rootReducer';

// --- State Interface ---
interface ComparisonState {
  data: ComparisonResponse | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

// --- Initial State ---
const initialState: ComparisonState = {
  data: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// --- Async Thunk for Fetching Comparison ---
export const fetchComparison = createAsyncThunk<
  ComparisonResponse,
  ComparisonInput,
  { state: RootState; rejectValue: string }
>('comparison/fetch', async (input, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    if (!token) {
      return thunkAPI.rejectWithValue('User not authenticated. No token found.');
    }
    return await comparisonService.findSimilarPatterns(input, token);
  } catch (error: any) {
    const message =
      (error.response?.data?.detail) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// --- Comparison Slice ---
export const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    resetComparison: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.data = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComparison.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchComparison.fulfilled, (state, action: PayloadAction<ComparisonResponse>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload;
      })
      .addCase(fetchComparison.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.data = null;
      });
  },
});

export const { resetComparison } = comparisonSlice.actions;
export const comparisonReducer = comparisonSlice.reducer;