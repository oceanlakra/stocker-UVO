import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import predictionService, { type PredictionResponse } from './predictionService';
import type { RootState } from '@/store/rootReducer';

// --- State Interface ---
interface PredictionState {
  data: PredictionResponse | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

// --- Initial State ---
const initialState: PredictionState = {
  data: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// --- Async Thunk for Fetching Prediction ---
export const fetchPrediction = createAsyncThunk<
  PredictionResponse, // Type of the return value on success
  string, // Type of the argument passed to the thunk (the ticker)
  { state: RootState; rejectValue: string } // ThunkAPI config
>('prediction/fetch', async (ticker, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    if (!token) {
      return thunkAPI.rejectWithValue('User not authenticated. No token found.');
    }
    return await predictionService.getPrediction(ticker, token);
  } catch (error: any) {
    const message =
      (error.response?.data?.detail) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// --- Prediction Slice ---
export const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    // Action to reset the state, e.g., when the component unmounts or a new prediction is requested
    resetPrediction: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      // Optionally reset data as well if you want the old prediction to disappear immediately
      // state.data = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrediction.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchPrediction.fulfilled, (state, action: PayloadAction<PredictionResponse>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload;
      })
      .addCase(fetchPrediction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.data = null;
      });
  },
});

export const { resetPrediction } = predictionSlice.actions;
export const predictionReducer = predictionSlice.reducer;