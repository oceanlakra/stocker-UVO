// src/features/analysis/analysisSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import analysisService, { type RedditSentimentInput, type RedditSentimentOutput } from './analysisService';

interface AnalysisState {
  data: RedditSentimentOutput | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  data: null,
  loading: false,
  error: null,
};

// Change: Remove token from thunk arguments, match PredictionCard pattern
export const fetchRedditSentiment = createAsyncThunk(
  'analysis/fetchRedditSentiment',
  async (input: RedditSentimentInput, thunkAPI) => {
    try {
      // The service should handle token (e.g., via axios interceptor)
      return await analysisService.getRedditSentimentAnalysis(input);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearAnalysis(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRedditSentiment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRedditSentiment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRedditSentiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
export const analysisReducer = analysisSlice.reducer;
